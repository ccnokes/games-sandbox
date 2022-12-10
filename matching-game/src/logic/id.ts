let counter = 0;

// get a globally unique id for the session
export default function id() {
  return String(++counter);
}