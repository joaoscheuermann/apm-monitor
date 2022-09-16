import { View, Text } from "@nodegui/react-nodegui"
import React from "react"
import { defaultLabeledValueLabelStyle, defaultLabeledValueValueStyle, defaultLabeledValueWrapperStyle } from "../../style/style"

interface LabeledValueProps {
  label: string,
  children: string
}

export default function LabeledValue ({ label, children, ...props }: LabeledValueProps) {
  return (
    <View
      style={defaultLabeledValueWrapperStyle}
    >
      <Text style={defaultLabeledValueLabelStyle}>
        {label}
      </Text>
      <Text style={defaultLabeledValueValueStyle} children={children} />
    </View>
  )
}