import { useMutation } from "@tanstack/react-query";
import { EmailGenerationRequest } from "@/types/email";
import { generateEmailAction } from "@/app/actions/generateEmail";

export function useGeminiEmail() {
  return useMutation({
    mutationFn: (data: EmailGenerationRequest & { tone?: string }) => generateEmailAction(data),
  });
}
