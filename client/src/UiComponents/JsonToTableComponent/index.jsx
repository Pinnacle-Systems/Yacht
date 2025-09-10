
import { JsonToTable} from "react-json-to-table";

function JsonToTableComponent() {
  // ===================== //
  // JSON Object
  // ===================== //
  const myJson = {
    "Student": { name: "Jack", email: "jack@xyz.com" },
    "Student id": 888,
    "Sponsors": [
      { name: "john", email: "john@@xyz.com" },
      { name: "jane", email: "jane@@xyz.com" }
    ],
    "Contact Details":[
        {name: "Mukesh", email: "Mukesh@gmail.com", lan: "45444"},
        {name: "Tamil", email: "tamil@gmail.com", mobile: [{name:"asdfasdf"},{name:"asdfasdf"},]},
    ]
  };

  return (
    <div className="App">
      {/* ===================== */}
      {/* HOW TO USE IT         */}
      {/* ===================== */}
      <JsonToTable json={myJson} />
      {/* ===================== */}
    </div>
  );
}
export default JsonToTableComponent;