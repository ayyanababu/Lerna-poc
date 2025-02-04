import React from 'react'
import "./Button.css"

export function Button({
  children,
  ...props
}: {
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

) {
  return (
    <button {...props} className='@myorg/ui-library-vite/button'>
      {
        children
      }
    </button>
  )
}
