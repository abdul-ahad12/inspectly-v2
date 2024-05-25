const getFolderStructure = (
  phone: string,
  fieldNames: string[],
  files: { [key: string]: Express.Multer.File[] },
) => {
  const array = fieldNames.map((fieldName) => {
    return {
      fileName: `mech-verification/${phone}/${files[fieldName][0].fieldname}`,
      file: files[fieldName][0].buffer,
    }
  })

  return array
}

export { getFolderStructure }
