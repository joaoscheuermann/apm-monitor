import { View, Text } from "@nodegui/react-nodegui"
import React from "react"

interface SeparatorProps {
  height?: number,
}

export default function Separator ({ height, ...props }: SeparatorProps) {
  return (
    <View style={`height: ${ height || 4 }px; width: 100%;`} />
)
}