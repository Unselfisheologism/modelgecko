declare module 'lucide-react' {
    import * as React from 'react'

    interface IconProps extends React.SVGProps<SVGSVGElement> {
        size?: number | string
        color?: string
        strokeWidth?: number | string
    }

    type Icon = React.FC<IconProps>

    export const Code: Icon
    export const Key: Icon
    export const CreditCard: Icon
    export const Globe: Icon
    export const Zap: Icon
    export const ArrowRight: Icon
    export const BarChart3: Icon
    export const Database: Icon
    export const Copy: Icon
    export const RefreshCw: Icon
    export const LogOut: Icon
    export const User: Icon
    export const Github: Icon
    export const Loader2: Icon
    export const CheckCircle: Icon
    export const Search: Icon
}
