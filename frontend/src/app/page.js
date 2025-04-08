import styles from "./page.module.css";
import Image from 'next/image';

export default function Home() {
  return (
      <main>
        <div className="container col-xxl-8 px-4 py-5">
          <div className="row flex-lg-row-reverse align-items-center g-5 py-5">
            <div className="col-10 col-sm-8 col-lg-6 text-center">
              <Image src="/image_example.jpg" className="d-block mx-lg-auto img-fluid" alt="example image" width={700} height={500}/>
              <small className={styles.caption}>Example results.</small >
            </div>
            <div className="col-lg-6">
              <h1 className={`${styles.title} fw-bold text-body-emphasis lh-1 mb-3`}>Plastic Bag Waste Detector</h1>
              <p className="lead">AI-powered system designed to identify and locate plastic bag waste in images. Ideal for applications in environmental monitoring, waste management, and recycling.</p>
            </div>
          </div>
        </div>
      </main>
  );
}
