import { View, Text } from "@nodegui/react-nodegui"
import React from "react"
import { defaultSectionBodyStyle, defaultSectionStyle, defaultTitleBodyStyle } from "../../style/style"

interface SectionProps {
  title: string,
  children: any[]
}

export default function Section ({ title, children, ...props }: SectionProps) {
  return (
    <View
      style={defaultSectionStyle}
    >
      <Text style={defaultTitleBodyStyle}>
        {title}
      </Text>
      <View style={defaultSectionBodyStyle}>
        {children}
      </View>
    </View>
)
}