export const formatDate = (dateString: string | Date) => {
  if (!dateString) return "N/A"

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) return "N/A"

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  })
}

export const formatDateTime = (dateString: string | Date) => {
  if (!dateString) return "N/A"

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) return "N/A"

  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  })
}
