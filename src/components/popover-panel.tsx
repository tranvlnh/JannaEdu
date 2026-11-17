"use client";

/** Popover gốc (popover="auto") tự đóng khi bấm link bên trong — layout không remount khi điều hướng client. */
export function PopoverPanel(props: React.ComponentProps<"div">) {
  return (
    <div
      popover="auto"
      {...props}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) e.currentTarget.hidePopover();
      }}
    />
  );
}
