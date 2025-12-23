import { Loader2 } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading: boolean;
}

export function LoadingButton({
  loading,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading ? (
        <Loader2 aria-hidden="true" className="animate-spin" />
      ) : (
        children
      )}
    </Button>
  );
}
