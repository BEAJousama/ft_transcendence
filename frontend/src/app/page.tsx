import { Button } from "@/components";
import "./globals.css";
import { FaBeer } from "react-icons/fa";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen gap-4">
      {/* <Button type="primary" variant="text">
        Click
      </Button> */}
      <Button type="success" variant="contained">
        <FaBeer />
        Click
      </Button>
      {/* <Button type="primary" variant="contained">
        Click
      </Button>
      <Button type="danger" variant="contained">
        Click
      </Button>
      <Button type="success" variant="contained">
        Click
      </Button> */}
    </div>
  );
}
