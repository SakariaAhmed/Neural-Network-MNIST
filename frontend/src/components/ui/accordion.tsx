"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

{/* //TODO */}

/*          

<div>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>What is MNIST database?</AccordionTrigger>
                <AccordionContent>
                  What Is the MNIST Database? MNIST is a collection of 70,000
                  black-and-white images of handwritten digits (0–9). Each image
                  is just 28×28 pixels, so they’re small and easy to work with.
                  Why Is It Famous? Standard Benchmark It’s like the “Hello,
                  World!” of computer vision: researchers and students around
                  the world use MNIST to test and compare new image-recognition
                  techniques. Easy to Understand The data set is simple—only
                  digits—so beginners can focus on learning machine-learning
                  methods without getting bogged down in complexity. Huge
                  Community Support Because so many people have worked with
                  MNIST, you’ll find tons of tutorials, code examples, and
                  pre-built tools ready to go. In Everyday Terms Think of MNIST
                  as a giant practice worksheet for computers: just as you might
                  trace hundreds of handwritten numbers to learn penmanship,
                  MNIST lets algorithms “practice” reading handwriting until
                  they get really good at it.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div> */ 