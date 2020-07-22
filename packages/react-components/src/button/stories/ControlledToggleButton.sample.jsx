import { ToggleButton } from "@react-components/button";
import { useState } from "react";

export function ControlledToggleButton() {
    const [isChecked, setIsChecked] = useState(false);

    return (
        <>
            <div className="mb6">
                <span className="dib fw6">checked:</span> {isChecked ? "true" : "false"}
            </div>
            <ToggleButton
                checked={isChecked}
                value="isActive"
                color={isChecked ? "primary" : undefined}
                onChange={() => { setIsChecked(x => !x); }}
            >
                {isChecked ? "On" : "Off"}
            </ToggleButton>
        </>
    );
}
