import "./Switch.css";

import { EmbeddedIcon } from "../../icons";
import { VisuallyHidden } from "../../visually-hidden";
import { bool, element, elementType, func, number, oneOf, oneOfType, string } from "prop-types";
import { embedBadge } from "../../badge";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { getSizeClass, mergeClasses, useAutofocus, useControllableState, useEventCallback } from "../../shared";
import { isNil } from "lodash";

const propTypes = {
    /**
     * A controlled checked state value.
     */
    checked: bool,
    /**
     * The initial value of `checked`.
     */
    defaultChecked: bool,
    /**
     * Whether or not the checkbox should autofocus on render.
     */
    autofocus: bool,
    /**
     * Delay before trying to autofocus.
     */
    autofocusDelay: number,
    /**
     * Called when the checkbox checked state change.
     * @param {SyntheticEvent} event - React's original SyntheticEvent.
     * @returns {void}
     */
    onChange: func,
    /**
     * [Icon](/?path=/docs/components-icon--default-story) component rendered after the text.
     */
    icon: element,
    /**
     * [Badge](/?path=/docs/components-badge--default-story) component rendered after the text.
     */
    badge: element,
    /**
     * A checkbox can vary in size.
     */
    size: oneOf(["small", "medium", "large"]),
    /**
     * Invert the order the checkmark box and the label.
     */
    reverse: bool,
    /**
     * An HTML element type or a custom React element type to render as.
     */
    as: oneOfType([string, elementType])
};

const defaultProps = {
    as: "label"
};

export function InnerSwitch({
    checked,
    defaultChecked,
    autofocus,
    autofocusDelay,
    onChange,
    icon,
    badge,
    size,
    reverse,
    name,
    tabIndex,
    active,
    focus,
    hover,
    disabled,
    readOnly,
    as: ElementType,
    className,
    children,
    forwardedRef,
    ...rest
}) {
    const [isChecked, setIsChecked] = useControllableState(checked, defaultChecked, false);

    const labelRef = useRef();
    const inputRef = useRef();

    const setFocus = useCallback(() => {
        if (!isNil(inputRef.current)) {
            inputRef.current.focus();
        }
    }, [inputRef]);

    const autofocusProps = useAutofocus(autofocus, autofocusDelay, disabled, setFocus);

    // Forward native input API to the external ref element.
    useImperativeHandle(forwardedRef, () => {
        const apiMethods = ["blur", "focus", "click", "checkValidity", "reportValidity", "setCustomValidity"];
        const domElement = labelRef.current;

        apiMethods.forEach(x => {
            domElement[x] = (...args) => {
                inputRef.current[x](...args);
            };
        });

        return domElement;
    });

    const labelMarkup = children && (
        <span className="label">{children}</span>
    );

    const iconMarkup = !isNil(icon) && (
        <EmbeddedIcon size={size}>{icon}</EmbeddedIcon>
    );

    // TODO: Add reverse
    const badgeMarkup = !isNil(badge) && embedBadge(badge, {
        size,
        disabled
    });

    const content = (
        <>
            {labelMarkup}
            {iconMarkup}
            {badgeMarkup}
        </>
    );

    const handleChange = useEventCallback(event => {
        setIsChecked(!isChecked);

        if (!isNil(onChange)) {
            onChange(event);
        }
    });

    return (
        <ElementType
            data-testid="switch"
            {...rest}
            className={mergeClasses(
                "o-ui switch",
                // TODO: Changed for "checked"
                isChecked && "on",
                iconMarkup && "with-icon",
                badgeMarkup && "with-badge",
                reverse && "reverse",
                disabled && "disabled",
                readOnly && "readonly",
                active && "active",
                focus && "focus",
                hover && "hover",
                getSizeClass(size),
                className
            )}
            ref={labelRef}
        >
            <VisuallyHidden
                {...autofocusProps}
                as="input"
                type="checkbox"
                checked={readOnly ? undefined : isChecked}
                onChange={readOnly ? undefined : handleChange}
                disabled={disabled}
                name={name}
                tabIndex={tabIndex}
                ref={inputRef}
            />
            <span className="switch"></span>
            {content}
        </ElementType>
    );
}

InnerSwitch.propTypes = propTypes;
InnerSwitch.defaultProps = defaultProps;

export const Switch = forwardRef((props, ref) => (
    <InnerSwitch { ...props } forwardedRef={ref} />
));

export const Toggle = Switch;
