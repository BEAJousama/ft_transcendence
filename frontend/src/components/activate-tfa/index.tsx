import { MdDelete } from "react-icons/md";
import Button from "../button";
import Divider from "../divider";
import axios from "axios";
import { useContext, useState } from "react";
import QrCode from "../qr-code";
import Input from "../input";
import { AppContext } from "../../context/app.context";

const ActivateTfa = ({
    setShowmodal,
    user,
    setUpdated,
}: {
    user: any;
    setShowmodal: React.Dispatch<React.SetStateAction<boolean>>;
    setUpdated?: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const { updateUser } = useContext(AppContext);
    const [error, setError] = useState("");
    const [code, setCode] = useState("");

    const TurnOnOrOffTfa = async (url: string) => {
        try {
            setError("");
            const accessToken = window.localStorage.getItem("access_token");
            const response = await axios.post(
                url,
                { code },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            if (response.data.message === "success") {
                await updateUser();
                setUpdated &&
                    setUpdated(
                        `Two Factor Authentication ${!user?.twoFactorAuth ? "Avtivated" : "deactivated"
                        } successfully`
                    );
                return;
            }
            setError("Invalid Code");
        } catch (error) {
            setError("Invalid Code");
        }
    };
    return (
        <div className="flex w-full flex-col items-center justify-center gap-4 p-4 text-quaternary-200">
            <span className="text-xl text-center">Two Factor Authentication</span>
            <QrCode />
            <div className="text-center">Enter 6-digit code from your two factor authenticator App</div>
            <div className="flex w-full max-w-md flex-col gap-4">
                <Input
                    className="text-center"
                    MaxLength={6}
                    name="code"
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value);
                    }}
                    error={error}
                    isError={!!error}
                />
                <div className="flex w-full items-center justify-center gap-4">
                    <Button
                        className="w-full justify-center"
                        type="success"
                        disabled={user?.twoFactorAuth}
                        onClick={() => {
                            TurnOnOrOffTfa(
                                `${process.env.REACT_APP_BACK_END_URL}api/auth/2fa/turn-on`
                            );
                        }}
                    >
                        Turn On
                    </Button>
                    <Button
                        className="w-full justify-center"
                        type="danger"
                        disabled={!user?.twoFactorAuth}
                        onClick={() => {
                            TurnOnOrOffTfa(
                                `${process.env.REACT_APP_BACK_END_URL}api/auth/2fa/turn-off`
                            );
                        }}
                    >
                        Turn Off
                    </Button>
                </div>
            </div>
            {/* <div className="w-full max-w-md">
                <Divider />
            </div>
            <span className="w-full max-w-md text-quaternary-200">Danger Zone</span>
            <Button
                className="w-full max-w-md justify-center"
                type="danger"
                onClick={() => {
                    setShowmodal(true);
                }}
            >
                <MdDelete />
                Remove account
            </Button> */}
        </div>
    );
};


export default ActivateTfa;