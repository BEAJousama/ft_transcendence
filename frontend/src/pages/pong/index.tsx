import { Sidepanel } from "../../components";

export default function Pong() {

  return (
    <div
      className="relative grid h-screen grid-cols-9 bg-secondary-700 lg:grid-cols-7"
    >
      <Sidepanel className="col-span-3 lg:col-span-1" />

    </div>
  );
}
