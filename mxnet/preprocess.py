import math
import os
import random
import shutil

import cv2
import fiftyone as fo
import pandas as pd
import albumentations as A
from PIL import Image
from matplotlib import pyplot as plt, patches
from tqdm import tqdm

pd.set_option('display.max_columns', None)

DATASET_PATH = "data"
MXNET_DATASET_PATH = "mxnet_data"
AUG_DATA_PATH = "aug_data"

fo.config.dataset_zoo_dir = DATASET_PATH
IM2REC_SSD_COLS = [
    "header_cols",
    "label_width",
    "class_id",
    "xmin",
    "ymin",
    "xmax",
    "ymax",
    "image_path",
]


def download_dataset() -> None:
    dataset = fo.zoo.load_zoo_dataset(
        "open-images-v6",
        split="train",
        label_types=["detections"],
        classes=["Plastic bag"],
        max_samples=1000,
    )

    dataset = fo.zoo.load_zoo_dataset(
        "open-images-v6",
        split="validation",
        label_types=["detections"],
        classes=["Plastic bag"],
        max_samples=100,
    )


def create_labels_df(split: str, class_names: list, redo=False) -> pd.DataFrame:
    df_path = f"{DATASET_PATH}/open-images-v6/{split}/labels/detections_filtered.csv"
    if redo == False and os.path.exists(df_path):
        print("File already exists: ", df_path)
        df = pd.read_csv(df_path)
        return df

    # load labels, classes
    labels_path =  f"{DATASET_PATH}/open-images-v6/{split}/labels/detections.csv"
    classes_path =  f"{DATASET_PATH}/open-images-v6/{split}/metadata/classes.csv"
    df = pd.read_csv(labels_path)
    classes_df = pd.read_csv(classes_path, names=['LabelName','className'])

    # filter by classes
    classes_df = classes_df[classes_df["className"].isin(class_names)]
    label_names = classes_df["LabelName"].unique()
    df = df[df["LabelName"].isin(label_names)]

    # format df
    label_to_id = {label: idx for idx, label in enumerate(label_names)}
    df["class_id"] = df["LabelName"].map(label_to_id)
    df = df[["class_id", "XMin", "YMin", "XMax", "YMax", "ImageID"]]
    df = df.rename(columns={'XMin': 'xmin', 'YMin': 'ymin', 'XMax': 'xmax', 'YMax': 'ymax', 'ImageID': 'image_id'})
    df.to_csv(df_path, index=False)

    return df


def create_lst_file(raw_df: pd.DataFrame, split: str, file_path: str):
    df = raw_df.copy()
    df['class_id'] = raw_df['class_id'].astype(str) + '.000'
    df['image_path'] = "class_" + raw_df['class_id'].astype(str) + f"/images/{split}/" + raw_df['image_id'].astype(str) + ".jpg"
    df['header_cols'] = 2  # one col for the number of header cols, one for the label_width
    df['label_width'] = 5  # number of cols for each label: class, x_min, y_min, x_max, y_max

    # Save .lst file
    df = df[IM2REC_SSD_COLS].reset_index(drop=True)
    df.to_csv(file_path, sep="\t", float_format="%.4f", header=None)


def create_mxnet_dataset(raw_df: pd.DataFrame, split: str):
    df = pd.DataFrame()
    df['image_path_src'] = f'{AUG_DATA_PATH}/{split}/data/' + raw_df['image_id'].astype(str) + '.jpg'
    df['image_path'] = f"{MXNET_DATASET_PATH}/class_" + raw_df['class_id'].astype(str) + f"/images/{split}/" + raw_df['image_id'].astype(str) + ".jpg"

    print("Creating mxnet dataset...")
    for row in df.itertuples():
        src_file = row.image_path_src
        dst_file = row.image_path
        dst_dir = os.path.dirname(dst_file)
        if not os.path.exists(dst_dir):
            os.makedirs(dst_dir)

        shutil.copy(src_file, dst_file)


def augment_data(df: pd.DataFrame, split: str, redo=False):
    aug_data_dir = f"{AUG_DATA_PATH}/{split}/data"
    aug_labels_dir = f"{AUG_DATA_PATH}/{split}/labels"
    if redo == False and os.path.exists(aug_data_dir) and os.path.exists(aug_labels_dir):
        print("File already exists: ", f"{AUG_DATA_PATH}/{split}")
        df = pd.read_csv(f"{aug_labels_dir}/detections.csv")
        return df
    else:
        os.makedirs(aug_data_dir, exist_ok=True)
        os.makedirs(aug_labels_dir, exist_ok=True)

    NUM_AUGS = 2
    transform = A.Compose([
        A.HorizontalFlip(p=0.5)
    ], bbox_params=A.BboxParams(format='albumentations', label_fields=['class_labels']))

    aug_rows = []
    for image_id in tqdm(df["image_id"].unique()):
        image_path = f'{DATASET_PATH}/open-images-v6/{split}/data/{image_id}.jpg'
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        rows = df[df["image_id"] == image_id]
        bboxes = rows[["xmin", "ymin", "xmax", "ymax"]].values.tolist()
        class_labels = rows["class_id"].values.tolist()

        for i in range(NUM_AUGS):
            transformed = transform(image=image, bboxes=bboxes, class_labels=class_labels)
            aug_image = transformed['image']
            aug_image = cv2.cvtColor(aug_image, cv2.COLOR_RGB2BGR)
            aug_bboxes = transformed['bboxes']
            aug_labels = transformed['class_labels']

            # Save the augmented image
            aug_image_id = f'{image_id}_aug_{i}'
            aug_image_path = f'{AUG_DATA_PATH}/{split}/data/{aug_image_id}.jpg'
            cv2.imwrite(aug_image_path, aug_image)

            for aug_bbox, aug_label in zip(aug_bboxes, aug_labels):
                aug_row = {
                    "class_id": int(aug_label),
                    "xmin": aug_bbox[0],
                    "ymin": aug_bbox[1],
                    "xmax": aug_bbox[2],
                    "ymax": aug_bbox[3],
                    "image_id": aug_image_id
                }
                aug_rows.append(aug_row)

    aug_df = pd.DataFrame(aug_rows)
    aug_df.to_csv(f"{AUG_DATA_PATH}/{split}/labels/detections.csv", index=False)

    return aug_df


def plot_samples(split: str, n: int = 5):
    df = pd.read_csv(f"{split}.lst", sep="\t", names=IM2REC_SSD_COLS)
    image_paths = df["image_path"].unique().tolist()
    image_paths = random.sample(image_paths, n)
    cols = 4
    rows = math.ceil(len(image_paths) / cols)
    fig, axes = plt.subplots(rows, cols, figsize=(4 * cols, 4 * rows))
    axes = axes.flatten()

    for i, image_path in enumerate(image_paths):
        image = Image.open(f"{MXNET_DATASET_PATH}/{image_path}")
        w, h = image.size
        sample_df = df[df['image_path'] == image_path]

        ax = axes[i]
        ax.imshow(image)
        title = image_path.split("/")[-1]
        ax.set_title(f"image_id={title}")
        ax.axis('on')
        padding = 10
        ax.set_xlim([-padding, w + padding])
        ax.set_ylim([h + padding, -padding])

        for row in sample_df.itertuples():
            xmin = int(row.xmin * w)
            ymin = int(row.ymin * h)
            xmax = int(row.xmax * w)
            ymax = int(row.ymax * h)
            rect = patches.Rectangle((xmin, ymin), xmax - xmin, ymax - ymin,
                                     linewidth=2, edgecolor="red", facecolor='none')
            ax.add_patch(rect)


    # Hide unused axes
    for j in range(i + 1, len(axes)):
        axes[j].axis('off')

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    download_dataset()

    class_names = ["Plastic bag"]

    for split in ["train", "validation"]:
        df = create_labels_df(split, class_names)
        df = augment_data(df, split)
        print(df.head(3))
        create_lst_file(df, split, f"{split}.lst")
        create_mxnet_dataset(df, split)

    shutil.make_archive(MXNET_DATASET_PATH, 'zip', MXNET_DATASET_PATH)

    plot_samples("train")






