import "./styles.css";
import ImageEditor from "./test";

export default function App() {
  return (
    <div className="App">
      <ImageEditor
        onSave={() => {
          console.log("onSave");
        }}
      />
    </div>
  );
}
