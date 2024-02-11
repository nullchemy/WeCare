const formatTimestamp = (timestamp: number): string => {
  const currentDate = new Date()
  const inputDate = new Date(timestamp)

  const isToday =
    currentDate.getFullYear() === inputDate.getFullYear() &&
    currentDate.getMonth() === inputDate.getMonth() &&
    currentDate.getDate() === inputDate.getDate()

  if (isToday) {
    const hours = inputDate.getHours()
    const minutes = inputDate.getMinutes()

    return `${hours > 12 ? hours - 12 : hours}:${
      minutes < 10 ? '0' : ''
    }${minutes} ${hours < 12 ? 'AM' : 'PM'}`
  } else {
    return inputDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })
  }
}

export default formatTimestamp
