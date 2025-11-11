import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { createFileRoute } from "@tanstack/react-router"
import {
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
} from "@heroicons/react/24/solid"

export const Route = createFileRoute("/_public/contact")({
  component: ContactPage,
})

function ContactPage() {
  return (
    <div className="mx-auto w-full">
      {/* Hero Section */}
      <section className="bg-muted/30 py-12 sm:py-16">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <h1 className="mb-4 font-bold text-3xl sm:text-4xl">Contact Us</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Get in touch with us. We're here to help with any questions about our courses and
            programs.
          </p>
        </div>
      </section>

      <Separator />

      {/* Contact Information */}
      <section className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Details */}
          <div className="space-y-6">
            <div>
              <h2 className="mb-6 font-bold text-2xl">Get in Touch</h2>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <MapPinIcon className="size-5 text-primary" />
                      Campus Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Dumingag, Zamboanga del Sur
                      <br />
                      Philippines
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <EnvelopeIcon className="size-5 text-primary" />
                      Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href="mailto:info@disoa.edu.ph"
                      className="text-primary text-sm hover:underline"
                    >
                      info@disoa.edu.ph
                    </a>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <PhoneIcon className="size-5 text-primary" />
                      Phone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      +63 XXX XXX XXXX
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <ClockIcon className="size-5 text-primary" />
                      Office Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Monday - Friday: 8:00 AM - 5:00 PM
                      <br />
                      Saturday: 8:00 AM - 12:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="mb-4 font-semibold text-lg">Follow Us</h3>
              <a
                href="https://facebook.com/disoa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook - DISOA Official
              </a>
            </div>
          </div>

          {/* Map */}
          <div>
            <h2 className="mb-6 font-bold text-2xl">Visit Our Campus</h2>
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  {/* Replace with actual Google Maps embed */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126358.03814058953!2d123.30!3d8.15!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMDknMDAuMCJOIDEyM8KwMTgnMDAuMCJF!5e0!3m2!1sen!2sph!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="DISOA Campus Location"
                  />
                </div>
              </CardContent>
            </Card>
            <p className="mt-4 text-muted-foreground text-sm">
              We welcome visitors to our campus. Please contact us to schedule a visit or tour of
              our facilities.
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA Section */}
      <section className="bg-muted/30 py-12 sm:py-16">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <h2 className="mb-4 font-bold text-2xl sm:text-3xl">Have Questions About Our Courses?</h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
            Check out our frequently asked questions or browse our course catalog to learn more.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <a href="/#courses">Browse Courses</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/faq">View FAQs</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}