import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

function FloatingPanelLayout({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="floating-panel-layout"
      className={cn(
        "relative z-20 flex h-dvh flex-col gap-4 p-3 sm:gap-6 sm:p-6 lg:flex-row lg:pl-0",
        className,
      )}
      {...props}
    />
  )
}

function FloatingPanelLayoutSide({
  className,
  ...props
}: React.ComponentProps<"aside">) {
  return (
    <aside
      data-slot="floating-panel-layout-side"
      className={cn(
        "hidden w-96 shrink-0 min-h-0 flex-col lg:flex",
        className,
      )}
      {...props}
    />
  )
}

function FloatingPanelLayoutFull({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="floating-panel-layout-full"
      className={cn(
        "relative z-20 flex min-h-0 flex-1 flex-col gap-6 lg:-ml-6",
        className,
      )}
      {...props}
    />
  )
}

function FloatingPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="floating-panel"
      className={cn(
        "flex min-h-0 flex-col overflow-hidden bg-background shadow-lg",
        "rounded-none border-0 lg:rounded-lg lg:border-2 lg:border-border",
        className,
      )}
      {...props}
    />
  )
}

function FloatingPanelHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="floating-panel-header"
      className={cn(
        "grid shrink-0 auto-rows-min items-center gap-1 border-b-2 border-border px-6 py-5",
        "has-data-[slot=floating-panel-description]:grid-rows-[auto_auto]",
        "has-data-[slot=floating-panel-header-action]:grid-cols-[1fr_auto] has-data-[slot=floating-panel-header-action]:gap-x-4",
        className,
      )}
      {...props}
    />
  )
}

function FloatingPanelHeaderAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="floating-panel-header-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-center justify-self-end",
        className,
      )}
      {...props}
    />
  )
}

function FloatingPanelTitle({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"h1"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "h1"
  return (
    <Comp
      data-slot="floating-panel-title"
      className={cn(
        "font-heading text-xl font-bold tracking-tight",
        className,
      )}
      {...props}
    />
  )
}

function FloatingPanelDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="floating-panel-description"
      className={cn("text-base text-muted-foreground", className)}
      {...props}
    />
  )
}

function FloatingPanelBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="floating-panel-body"
      className={cn("flex-1 overflow-auto", className)}
      {...props}
    />
  )
}

function FloatingPanelDivider({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="floating-panel-divider"
      className={cn(
        "flex h-14 items-center border-b-2 border-border bg-muted/40 px-6 font-heading text-base font-semibold uppercase tracking-wider text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

function FloatingPanelCard({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="floating-panel-card"
      className={cn(
        "group/floating-panel-card flex items-center gap-3 border-b-2 border-border bg-card px-5 py-5 text-left transition-colors sm:gap-5 sm:px-8 sm:py-7",
        "hover:bg-muted/40",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  )
}

function FloatingPanelFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="floating-panel-footer"
      className={cn("shrink-0 border-t-2 border-border", className)}
      {...props}
    />
  )
}

function FloatingPanelTable({
  className,
  ...props
}: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="floating-panel-table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="floating-panel-table"
        className={cn("w-full min-w-max caption-bottom", className)}
        {...props}
      />
    </div>
  )
}

function FloatingPanelTableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="floating-panel-table-header"
      className={cn("bg-muted/40", className)}
      {...props}
    />
  )
}

function FloatingPanelTableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="floating-panel-table-body"
      className={className}
      {...props}
    />
  )
}

function FloatingPanelTableRow({
  className,
  ...props
}: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="floating-panel-table-row"
      className={cn(
        "group/floating-panel-table-row border-b-2 border-border transition-colors",
        "hover:bg-muted/40 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  )
}

function FloatingPanelTableHead({
  className,
  ...props
}: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="floating-panel-table-head"
      className={cn(
        "border-b-2 border-border px-4 py-3 text-left align-middle font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground sm:px-8",
        className,
      )}
      {...props}
    />
  )
}

function FloatingPanelTableCell({
  className,
  ...props
}: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="floating-panel-table-cell"
      className={cn("px-4 py-5 align-middle text-base sm:px-8 sm:py-7", className)}
      {...props}
    />
  )
}

export {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelCard,
  FloatingPanelDescription,
  FloatingPanelDivider,
  FloatingPanelFooter,
  FloatingPanelHeader,
  FloatingPanelHeaderAction,
  FloatingPanelLayout,
  FloatingPanelLayoutFull,
  FloatingPanelLayoutSide,
  FloatingPanelTable,
  FloatingPanelTableBody,
  FloatingPanelTableCell,
  FloatingPanelTableHead,
  FloatingPanelTableHeader,
  FloatingPanelTableRow,
  FloatingPanelTitle,
}
