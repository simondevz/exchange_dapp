export default function Spinner({ type }: { type?: "table" }) {
  if (type === "table") {
    return <tbody className="spinner-border text-light text-center"></tbody>;
  } else {
    return <div className="spinner-border text-light text-center"></div>;
  }
}
