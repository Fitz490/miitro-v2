import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSubmitContact } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const submitMutation = useSubmitContact({
    mutation: {
      onSuccess: () => {
        toast({ title: "Message Sent", description: "We'll get back to you shortly." });
        reset();
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to send message." });
      }
    }
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = (data: ContactFormValues) => {
    submitMutation.mutate({ data });
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted-foreground text-lg">Have questions about the program? Reach out to our team.</p>
        </div>

        <Card className="p-2 md:p-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input {...register("name")} placeholder="John Doe" />
                  {errors.name && <span className="text-sm text-destructive">{errors.name.message}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input {...register("email")} type="email" placeholder="john@example.com" />
                  {errors.email && <span className="text-sm text-destructive">{errors.email.message}</span>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone (Optional)</label>
                <Input {...register("phone")} placeholder="(555) 123-4567" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea 
                  {...register("message")} 
                  className="flex min-h-[150px] w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 resize-none"
                  placeholder="How can we help?"
                />
                {errors.message && <span className="text-sm text-destructive">{errors.message.message}</span>}
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || submitMutation.isPending}>
                {submitMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
