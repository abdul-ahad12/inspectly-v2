import { ZCreateInspectionPackageRoSchema } from '../create'

const ZUpdateInspectionPackagePrice = ZCreateInspectionPackageRoSchema.pick({
  price: true,
  strikePrice: true,
})

export { ZUpdateInspectionPackagePrice }
