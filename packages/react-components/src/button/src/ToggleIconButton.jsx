import { IconButton } from "./IconButton";
import { any, bool, elementType, func, number, oneOf, oneOfType, string } from "prop-types";
import { forwardRef } from "react";
import { isFunction } from "lodash";
import { useCheckableProps } from "../../shared";
import { useToggleButton } from "./useToggleButton";

const propTypes = {
    /**
     * A controlled checked value.
     */
    checked: bool,
    /**
     * The initial value of `checked` when uncontrolled.
     */
    defaultChecked: bool,
    /**
     * 	The value to associate with when in a group.
     */
    value: oneOfType([string, number]),
    /**
     * Called when the button checked state change.
     * @param {SyntheticEvent} event - React's original SyntheticEvent.
     * @param {bool} isChecked - Whether the button is checked.
     * @returns {void}
     */
    onChange: func,
    /**
     * Style to use.
     */
    variant: oneOf(["solid", "outline", "ghost"]),
    /**
     * The color accent.
     */
    color: oneOf(["primary", "secondary"]),
    /**
     * The button shape.
     */
    shape: oneOf(["pill", "rounded", "circular"]),
    /**
     * Whether the button should autoFocus on render.
     */
    autoFocus: bool,
    /**
     * Delay before trying to autofocus.
     */
    autoFocusDelay: number,
    /**
     * A button can vary in size.
     */
    size: oneOf(["small", "medium", "large"]),
    /**
     * An HTML element type or a custom React element type to render as.
     */
    as: oneOfType([string, elementType]),
    /**
     * @ignore
     */
    children: any.isRequired
};

const defaultProps = {
    variant: "solid",
    shape: "pill",
    as: IconButton
};

export function InnerToggleIconButton(props) {
    const {
        checked,
        defaultChecked,
        value,
        onChange,
        onClick,
        active,
        as: ElementType,
        children,
        forwardedRef,
        ...rest
    } = useCheckableProps(props);

    const { isChecked, buttonProps } = useToggleButton({
        checked,
        defaultChecked,
        value,
        onChange,
        onClick,
        active,
        forwardedRef
    });

    const content = isFunction(children)
        ? children({ isChecked }, props)
        : children;

    return (
        <ElementType
            data-testid="toggle-icon-button"
            {...rest}
            {...buttonProps}
        >
            {content}
        </ElementType>
    );
}

InnerToggleIconButton.propTypes = propTypes;
InnerToggleIconButton.defaultProps = defaultProps;

export const ToggleIconButton = forwardRef((props, ref) => (
    <InnerToggleIconButton { ...props } forwardedRef={ref} />
));
