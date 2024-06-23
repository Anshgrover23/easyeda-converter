import { z } from "zod"
import { ShapeItemSchema } from "./shape-schema"

export const maybeNumber = z
  .any()
  .transform((k) => (k === "nan" || Number.isNaN(k) ? null : k))
  .pipe(z.number().nullable().optional())

export const SzlcscSchema = z.object({
  id: z.number(),
  number: z.string(),
  step: z.number(),
  min: z.number(),
  price: z.number(),
  stock: z.number(),
  url: z.string().url(),
  image: z.string().optional(),
})

export const LcscSchema = z.object({
  id: z.number(),
  number: z.string(),
  step: z.number(),
  min: z.number(),
  price: z.number(),
  stock: z.number(),
  url: z.string().url(),
})

export const OwnerSchema = z.object({
  uuid: z.string(),
  username: z.string(),
  nickname: z.string(),
  avatar: z.string(),
})

export const HeadSchema = z.object({
  docType: z.string(),
  editorVersion: z.string(),
  c_para: z.record(z.string(), z.string()),
  x: z.number(),
  y: z.number(),
  puuid: z.string().optional(),
  uuid: z.string(),
  utime: z.number(),
  importFlag: z.number(),
  c_spiceCmd: z.any().optional(),
  hasIdFlag: z.boolean(),
})

export const BBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
})

export const LayerItemSchema = z.object({
  name: z.string(),
  color: z.string(),
  visible: z.boolean(),
  active: z.boolean(),
  config: z.boolean(),
  transparency: z.boolean(),
})

export const ObjectItemSchema = z.object({
  name: z.string(),
  visible: z.boolean(),
  locked: z.boolean(),
})

export const DataStrSchema = z.object({
  head: HeadSchema,
  canvas: z.string(),
  shape: z.array(z.string()).transform((shapes) =>
    shapes.map((shape) => {
      const [type, ...data] = shape.split("~")
      return ShapeItemSchema.parse({ type, data: data.join("~") })
    })
  ),
  BBox: BBoxSchema,
  colors: z.array(z.unknown()),
})

export const PackageDetailDataStrSchema = z.object({
  head: HeadSchema,
  canvas: z.string(),
  shape: z
    .array(z.string())
    .transform((shapes) =>
      shapes.map((shape) => {
        const [type, ...data] = shape.split("~")
        return ShapeItemSchema.parse({ type, data: data.join("~") })
      })
    )
    .pipe(z.array(ShapeItemSchema)),
  layers: z.array(z.string()).transform((layers) =>
    layers.map((layer) => {
      const [name, color, visible, active, config, transparency] =
        layer.split("~")
      return LayerItemSchema.parse({
        name,
        color,
        visible: visible === "true",
        active: active === "true",
        config: config === "true",
        transparency: transparency === "true",
      })
    })
  ),
  objects: z.array(z.string()).transform((objects) =>
    objects.map((obj) => {
      const [name, visible, locked] = obj.split("~")
      return ObjectItemSchema.parse({
        name,
        visible: visible === "true",
        locked: locked === "true",
      })
    })
  ),
  BBox: BBoxSchema,
  netColors: z.array(z.unknown()),
})

export const PackageDetailSchema = z.object({
  uuid: z.string(),
  title: z.string(),
  docType: z.number(),
  updateTime: z.number(),
  owner: OwnerSchema,
  datastrid: z.string(),
  writable: z.boolean(),
  dataStr: PackageDetailDataStrSchema,
})

export const EasyEdaJsonSchema = z.object({
  uuid: z.string(),
  title: z.string(),
  description: z.string(),
  docType: z.number(),
  type: z.number(),
  szlcsc: SzlcscSchema,
  lcsc: LcscSchema,
  owner: OwnerSchema,
  tags: z.array(z.string()),
  updateTime: z.number(),
  updated_at: z.string(),
  dataStr: DataStrSchema,
  verify: z.boolean(),
  SMT: z.boolean(),
  datastrid: z.string(),
  jlcOnSale: z.number(),
  writable: z.boolean(),
  isFavorite: z.boolean(),
  packageDetail: PackageDetailSchema,
})

export type EasyEdaJson = z.infer<typeof EasyEdaJsonSchema>
