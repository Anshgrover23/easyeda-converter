import { z } from "zod"

/**
 I'll break down the elements in the `dataStr.head.shape` array and explain what they represent. This array contains instructions for drawing the schematic symbol of the component.
1. `"R~365~275~2~2~70~50~#880000~1~0~none~gge1~0~"`
   This represents a rectangle:
   - Starting position: (365, 275)
   - Width: 70
   - Height: 50
   - Color: #880000 (dark red)
   - Line width: 1
   - Other parameters are for internal use
2. `"E~370~280~1.5~1.5~#880000~1~0~#880000~gge2~0"`
   This draws an ellipse:
   - Center: (370, 280)
   - Radius X: 1.5
   - Radius Y: 1.5
   - Color: #880000 (dark red)
   - Line width: 1
3-10. `"P~show~0~1~355~285~180~gge5~0^^355~285^^M355,285h10~#000000^^1~368.7~289~0~GND~start~~~#000000^^1~364.5~284~0~1~end~~~#000000^^0~362~285^^0~M 365 288 L 368 285 L 365 282"`
   These represent pins of the component. Each pin has:
   - Pin number
   - Position
   - Orientation
   - Label (e.g., GND, TRIG, OUT)
   - Color
   - Drawing instructions for the pin shape
To parse this data:
1. Split the string by `~` to get individual parameters.
2. For rectangles (R), use parameters 2-7 for position, size, and color.
3. For ellipses (E), use parameters 2-5 for position and size, and 6 for color.
4. For pins (P), split further by `^^` to get different sections:
   - First section: general pin properties
   - Second section: pin position
   - Third section: line drawing instruction
   - Fourth and Fifth sections: label position and text
   - Sixth section: additional drawing instruction for pin shape
This data structure allows for a compact representation of the schematic symbol, which can be rendered by CAD software to display the component in circuit diagrams.
 */
// Examples
// "R~365~275~2~2~70~50~#880000~1~0~none~gge1~0~",
// "E~370~280~1.5~1.5~#880000~1~0~#880000~gge2~0",
// "P~show~0~1~355~285~180~gge5~0^^355~285^^M355,285h10~#000000^^1~368.7~289~0~GND~start~~~#000000^^1~364.5~284~0~1~end~~~#000000^^0~362~285^^0~M 365 288 L 368 285 L 365 282",
// "P~show~0~2~355~295~180~gge6~0^^355~295^^M355,295h10~#880000^^1~368.7~299~0~TRIG~start~~~#0000FF^^1~364.5~294~0~2~end~~~#0000FF^^0~362~295^^0~M 365 298 L 368 295 L 365 292",
// "P~show~0~3~355~305~180~gge7~0^^355~305^^M355,305h10~#880000^^1~368.7~309~0~OUT~start~~~#0000FF^^1~364.5~304~0~3~end~~~#0000FF^^0~362~305^^0~M 365 308 L 368 305 L 365 302",
// "P~show~0~4~355~315~180~gge8~0^^355~315^^M355,315h10~#880000^^1~368.7~319~0~RESET~start~~~#0000FF^^1~364.5~314~0~4~end~~~#0000FF^^0~362~315^^0~M 365 318 L 368 315 L 365 312",
// "P~show~0~5~445~315~0~gge9~0^^445~315^^M445,315h-10~#880000^^1~431.3~319~0~CONT~end~~~#0000FF^^1~435.5~314~0~5~start~~~#0000FF^^0~438~315^^0~M 435 312 L 432 315 L 435 318",
// "P~show~0~6~445~305~0~gge10~0^^445~305^^M445,305h-10~#880000^^1~431.3~309~0~THRES~end~~~#0000FF^^1~435.5~304~0~6~start~~~#0000FF^^0~438~305^^0~M 435 302 L 432 305 L 435 308",
// "P~show~0~7~445~295~0~gge11~0^^445~295^^M445,295h-10~#880000^^1~431.3~299~0~DISCH~end~~~#0000FF^^1~435.5~294~0~7~start~~~#0000FF^^0~438~295^^0~M 435 292 L 432 295 L 435 298",
// "P~show~0~8~445~285~0~gge12~0^^445~285^^M445,285h-10~#FF0000^^1~431.3~289~0~VCC~end~~~#FF0000^^1~435.5~284~0~8~start~~~#FF0000^^0~438~285^^0~M 435 282 L 432 285 L 435 288",

const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
})

const RectangleShapeOutputSchema = z.object({
  type: z.literal("RECTANGLE"),
  position: PointSchema,
  width: z.number(),
  height: z.number(),
  color: z.string(),
  lineWidth: z.number(),
  id: z.string(),
})

export const RectangleShapeSchema = z
  .string()
  .startsWith("R~")
  .transform((str): z.infer<typeof RectangleShapeOutputSchema> => {
    const [, x, y, , , width, height, color, lineWidth, , , id] = str.split("~")
    return {
      type: "RECTANGLE",
      position: { x: Number(x), y: Number(y) },
      width: Number(width),
      height: Number(height),
      color,
      lineWidth: Number(lineWidth),
      id,
    }
  })
  .pipe(RectangleShapeOutputSchema)

const EllipseShapeOutputSchema = z.object({
  type: z.literal("ELLIPSE"),
  center: PointSchema,
  radiusX: z.number(),
  radiusY: z.number(),
  color: z.string(),
  lineWidth: z.number(),
  id: z.string(),
})

export const EllipseShapeSchema = z
  .string()
  .startsWith("E~")
  .transform((str): z.infer<typeof EllipseShapeOutputSchema> => {
    const [, x, y, radiusX, radiusY, color, lineWidth, , , id] = str.split("~")
    return {
      type: "ELLIPSE",
      center: { x: Number(x), y: Number(y) },
      radiusX: Number(radiusX),
      radiusY: Number(radiusY),
      color,
      lineWidth: Number(lineWidth),
      id,
    }
  })
  .pipe(EllipseShapeOutputSchema)

//   type PinDirection = 'left' | 'right';

// interface Pin {
//   type: 'P';
//   visibility: string;
//   id: string;
//   pin: number;
//   x: number;
//   y: number;
//   rotation: number;
//   name: string;
//   color: string;
//   path: string;
//   arrow: string;
//   direction: PinDirection;
// }
const PinShapeOutputSchema = z.object({
  type: z.literal("PIN"),
  visibility: z.enum(["show", "hide"]),
  pinNumber: z.number(),
  x: z.number(),
  y: z.number(),
  rotation: z.number(),
  id: z.string(),
  label: z.string(),
  labelColor: z.string(),
  path: z.string(),
  arrow: z.string(),
})

function parsePin(pinString: string): z.infer<typeof PinShapeOutputSchema> {
  const parts = pinString.split("~")
  const [_, visibility, __, pinNumber, x, y, rotation, id] = parts

  const nameMatch = pinString.match(/~(\w+)~start~/)
  const label = nameMatch ? nameMatch[1] : ""

  // TODO: make sure colors are associated properly
  const colorMatch = pinString.match(/#[0-9A-F]{6}/)
  const labelColor = colorMatch ? colorMatch[0] : ""

  const pathMatch = pinString.match(/\^\^([^~]+)/)
  const path = pathMatch ? pathMatch[1] : ""

  const arrowMatch = pinString.match(/\^\^0~(.+)$/)
  const arrow = arrowMatch ? arrowMatch[1] : ""

  return {
    type: "PIN",
    visibility: visibility as "show" | "hide",
    id,
    pinNumber: parseInt(pinNumber),
    x: parseFloat(x),
    y: parseFloat(y),
    rotation: parseFloat(rotation),
    label,
    labelColor,
    path,
    arrow,
  }
}

export const PinShapeSchema = z
  .string()
  .startsWith("P~")
  .transform((str): z.infer<typeof PinShapeOutputSchema> => {
    return parsePin(str)
  })
  .pipe(PinShapeOutputSchema)

export const SingleLetterShapeSchema = z
  .string()
  .transform((x) => {
    // We do some discrimination here for better errors
    if (x.startsWith("R~")) {
      return RectangleShapeSchema.parse(x)
    } else if (x.startsWith("E~")) {
      return EllipseShapeSchema.parse(x)
    } else if (x.startsWith("P~")) {
      return PinShapeSchema.parse(x)
    } else {
      throw new Error("Invalid shape type: " + x)
    }
  })
  .pipe(
    z.union([
      RectangleShapeOutputSchema,
      EllipseShapeOutputSchema,
      PinShapeOutputSchema,
    ])
  )
