import { z } from 'zod'

const ZstripeDocUploadPurposeEnum = z.enum(
  [
    'account_requirement',
    'additional_verification',
    'customer_signature',
    'dispute_evidence',
    'identity_document',
    'pci_document',
    'tax_document_user_upload',
  ],
  {
    description:
      'the purpose of the file being uploaded to stripe for verification purposes. \nFor more info read: https://docs.stripe.com/file-upload#uploading-a-file',
  },
)

export { ZstripeDocUploadPurposeEnum }
