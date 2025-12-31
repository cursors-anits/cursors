import { toast as sonnerToast, type ExternalToast } from "sonner"

export function useToast() {
    return {
        toast: (props: {
            title?: string
            description?: string
            variant?: "default" | "destructive"
            duration?: number
        } & ExternalToast) => {
            const { title, description, variant, duration, ...options } = props

            if (variant === "destructive") {
                return sonnerToast.error(title || "Error", {
                    description,
                    duration,
                    ...options
                })
            }

            return sonnerToast.success(title || "Success", {
                description,
                duration,
                ...options
            })
        }
    }
}
