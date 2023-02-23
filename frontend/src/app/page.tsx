import { Button, Input } from "@/components";
import "./globals.css";
import { FaBeer } from "react-icons/fa";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen gap-4 flex-col">
      <div className="flex items-center justify-center m-4 gap-4">
        <Button type="primary" variant="text">
          Click
        </Button>
        <Button type="primary" variant="contained">
          <FaBeer />
          Click
        </Button>
        <Button type="primary" variant="outlined">
          Click
        </Button>
        <Button type="danger">Click</Button>
        <Button type="success">Click</Button>
        <Button type="cuation">Click</Button>
      </div>
      <div className="flex items-center justify-center m-4 gap-4 flex-col w-60">
        <Input label={"username"} />
        <Input
          label={"username"}
          htmlType="select"
          options={["hello", "test", "fdjjd", "dfjjfdjfd", "fjdjffjdj"]}
        />
      </div>
    </div>
  );
}
