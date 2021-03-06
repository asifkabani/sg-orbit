import "./Popper.css";

import { Children, forwardRef, useState } from "react";
import { array, arrayOf, bool, instanceOf, number, object, oneOf } from "prop-types";
import { augmentElement, mergeClasses, useEventCallback, useMergedRefs, useResizeObserver } from "../../shared";
import { createPortal } from "react-dom";
import { isFunction, isNil, merge } from "lodash";
import { usePopper } from "react-popper";

const propTypes = {
    /**
     * A controlled show value that determined whether or not the popper is displayed.
     */
    show: bool,
    /**
     * The popper trigger element.
     */
    triggerElement: instanceOf(HTMLElement),
    /**
     * Position of the popper element.
     */
    position: oneOf([
        "auto",
        "auto-start",
        "auto-end",
        "top",
        "top-start",
        "top-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "right",
        "right-start",
        "right-end",
        "left",
        "left-start",
        "left-end"
    ]),
    /**
     * When true, disables automatic repositioning of the component, it will always be placed according to the position value.
     */
    pinned: bool,
    /**
     * Whether to render the popper element in an additional element that will handles [Popper.js](https://popper.js.org) references, attributes and styles.
     */
    noWrap: bool,
    /**
     * Allow to displace the popper element from its trigger element.
     * Ex: `[10, -10]`
     */
    offset: arrayOf(number),
    /**
     * An array of modifiers passed directly to [Popper.js](https://popper.js.org) modifiers. For more info, view [Popper.js modifiers documentation](https://popper.js.org/docs/v2/modifiers).
     */
    popperModifiers: array,
    /**
     * A set of options passed directly to [Popper.js](https://popper.js.org). For more info, view [Popper.js options documentation](https://popper.js.org/docs/v2/constructors/#options).
     */
    popperOptions: object,
    /**
     * A DOM element in which the popper element will appended via a React portal.
     */
    portalContainerElement: instanceOf(HTMLElement),
    /**
     * z-index of the popper.
     */
    zIndex: number,
    /**
     * Whether to render the popper element with React portal. The popper element will be rendered within it's parent DOM hierarchy.
     */
    noPortal: bool,
    /**
     * Whether to animate the popper element when opening / closing.
     */
    animate: bool
};

const defaultProps = {
    position: "bottom",
    animate: true
};

function disableModifier(name, modifiers) {
    const modifier = modifiers.find(x => x.name === name);

    if (!isNil(modifier)) {
        modifier.enabled = false;
    } else {
        modifiers.push({
            name: name,
            enabled: false
        });
    }
}

function setModifierOptions(name, options, modifiers) {
    const modifier = modifiers.find(x => x.name === name);

    if (!isNil(modifier)) {
        modifier.options = merge(modifier.options, options);
    } else {
        modifiers.push({
            name,
            options
        });
    }
}

function createPopperModifiers(pinned, offset, popperModifiers) {
    const mergedModifiers = popperModifiers || [];

    if (pinned) {
        disableModifier("preventOverflow", mergedModifiers);
        disableModifier("flip", mergedModifiers);
    }

    if (!isNil(offset)) {
        setModifierOptions("offset", { offset }, mergedModifiers);
    }

    return mergedModifiers;
}

function usePopperInstance(position, triggerElement, pinned, offset, popperModifiers, popperOptions, popperElement) {
    const modifiers = createPopperModifiers(pinned, offset, popperModifiers);

    const { styles, attributes, update: updatePopper } = usePopper(triggerElement, popperElement, {
        placement: position,
        modifiers,
        ...(popperOptions || {})
    });

    const handlePopperElementResize = useEventCallback(() => {
        if (isFunction(updatePopper)) {
            updatePopper();
        }
    });

    useResizeObserver(popperElement, handlePopperElementResize);

    return [styles.popper, attributes.popper];
}

export function InnerPopper({
    show,
    position,
    triggerElement,
    pinned,
    noWrap,
    offset,
    popperModifiers,
    popperOptions,
    portalContainerElement: portalElement,
    zIndex,
    noPortal,
    animate,
    className,
    style,
    forwardedRef,
    children,
    ...rest
}) {
    const [popperElement, setPopperElement] = useState();

    const popperRef = useMergedRefs(forwardedRef, setPopperElement);

    const [popperStyles, popperAttributes] = usePopperInstance(position, triggerElement, pinned, offset, popperModifiers, popperOptions, popperElement);

    const wrapPopper = popper => {
        return (
            <div
                {...rest}
                className={mergeClasses(
                    "outline-0",
                    className
                )}
                tabIndex="-1"
                data-testid="popper-wrapper"
            >
                {popper}
            </div>
        );
    };

    const popperContent = Children.only(children);

    // The "show" condition is a fix for "react-dates" calendar. If the calendar is rendered before being shown, he will remain "hidden"
    // even when the popper is visible.
    const popperMarkup = show && augmentElement(!noWrap ? wrapPopper(popperContent) : popperContent, {
        style: {
            ...style,
            ...popperStyles,
            display: show ? "block" : "none",
            animation: animate ? "o-ui-popper-fade-in 0.3s" : undefined,
            zIndex: zIndex || 0
        },
        ...popperAttributes,
        ref: popperRef
    });

    return (
        <Choose>
            <When condition={noPortal}>
                {popperMarkup}
            </When>
            <Otherwise>
                {createPortal(popperMarkup, portalElement || window.document.body)}
            </Otherwise>
        </Choose>
    );
}

InnerPopper.propTypes = propTypes;
InnerPopper.defaultProps = defaultProps;

export const Popper = forwardRef((props, ref) => (
    <InnerPopper { ...props } forwardedRef={ref} />
));
