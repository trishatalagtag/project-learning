import { useMutation } from "convex/react";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";
import { useState } from "react";
import { toast } from "sonner";

interface MutationConfig<Mutation extends FunctionReference<"mutation">> {
  successMessage?: string | ((args: FunctionArgs<Mutation>) => string);
  errorMessage?: string | ((error: Error) => string);
  onSuccess?: (
    result: FunctionReturnType<Mutation>,
    args: FunctionArgs<Mutation>
  ) => void | Promise<void>;
  onError?: (error: Error, args: FunctionArgs<Mutation>) => void;
}

export function useMutationWithToast<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  config: MutationConfig<Mutation> = {}
) {
  const convexMutation = useMutation(mutation);
  const [isPending, setIsPending] = useState(false);

  const execute = async (
    args: FunctionArgs<Mutation>
  ): Promise<{
    success: boolean;
    data?: FunctionReturnType<Mutation>;
  }> => {
    setIsPending(true);
    try {
      const result = await convexMutation(args);

      const successMsg = typeof config.successMessage === "function"
        ? config.successMessage(args)
        : config.successMessage ?? "Success";

      toast.success(successMsg);

      await config.onSuccess?.(result, args);

      return { success: true, data: result };
    } catch (error) {
      const errorMsg = typeof config.errorMessage === "function"
        ? config.errorMessage(error as Error)
        : config.errorMessage ?? (error instanceof Error ? error.message : "Failed");

      toast.error(errorMsg, { duration: 5000 });

      config.onError?.(error as Error, args);

      return { success: false };
    } finally {
      setIsPending(false);
    }
  };

  return { execute, isPending };
}
