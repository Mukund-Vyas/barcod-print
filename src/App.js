// import logo from "./barcode.png";
import "./App.css";
import { useState } from "react";
import JsPDF from "jspdf";
import html2canvas from "html2canvas";
import Barcode from "react-barcode";

function App() {
  const [file, setFile] = useState();
  const [array, setArray] = useState([]);

  const fileReader = new FileReader();

  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };

  const csvFileToArray = (string) => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

    const array = csvRows.map((i) => {
      const values = i.split(",");
      const obj = csvHeader.reduce((object, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
      return obj;
    });

    setArray(array);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (file) {
      fileReader.onload = function (event) {
        const text = event.target.result;
        csvFileToArray(text);
      };

      fileReader.readAsText(file);
    }
  };

  const headerKeys = Object.keys(Object.assign({}, ...array));

  const generatePDF = async () => {
    if (file != null) {
      const element = document.querySelector("#barcodes");
      const canvas = await html2canvas(element);
      // const data = canvas.toDataURL("image/png");

      // const report = new JsPDF("portrait", "pt", "a4");
      // // report.addImage(logo,"svg",5,5,0,0);
      // report.html(document.querySelector("#barcodes")).then(() => {
      //   report.save("file.pdf");
      // });

      //2--------2
      // const pdf = new JsPDF();
      // const imgProperties = pdf.getImageProperties(data);
      // const pdfWidth = pdf.internal.pageSize.getWidth();
      // const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

      // pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
      // pdf.save('print.pdf');

      //3--------3
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 190;
      const pageHeight = 290;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      const doc = new JsPDF("pt", "mm");
      let position = 0;
      doc.addImage(imgData, "PNG", 10, 0, imgWidth, imgHeight + 25);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight + 25);
        heightLeft -= pageHeight;
      }
      doc.save("download.pdf");
      // setLoader(false);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Exotica Barcode Generator</h1>
      <form>
        <input
          type={"file"}
          id={"csvFileInput"}
          accept={".csv"}
          onChange={handleOnChange}
        />

        <button
          onClick={(e) => {
            handleOnSubmit(e);
          }}
        >
          IMPORT CSV
        </button>
      </form>
      <button onClick={generatePDF} type="button">
        Export PDF
      </button>
      <br />

      <div id="barcodes" size="A4">
        <table>
          <thead>
            <tr key={"header"}>
              {headerKeys.map((key) => (
                <th>{key}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {array.map((item) => (
              <>
                <tr key={item.id}>
                  {Object.values(item).map((val) => (
                    <>
                      <td>{val}</td>
                      <td>
                        <Barcode value={val} />
                      </td>
                    </>
                  ))}
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
