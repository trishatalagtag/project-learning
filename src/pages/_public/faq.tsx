import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid"

export const Route = createFileRoute("/_public/faq")({
  component: FAQPage,
})

function FAQPage() {
  return (
    <div className="mx-auto w-full">
      {/* Hero Section */}
      <section className="bg-muted/30 py-12 sm:py-16">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <QuestionMarkCircleIcon className="mx-auto mb-4 size-16 text-primary" />
          <h1 className="mb-4 font-bold text-3xl sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Find answers to common questions about DISOA's online learning platform.
          </p>
        </div>
      </section>

      <Separator />

      {/* FAQ Sections */}
      <section className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
        {/* General Questions */}
        <div className="mb-12">
          <h2 className="mb-6 font-bold text-2xl">General Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is DISOA?</AccordionTrigger>
              <AccordionContent>
                DISOA (Dumingag Institute of Sustainable Organic Agriculture) is an agricultural
                training institute that provides free, accessible education in sustainable and
                organic farming practices to Filipino farmers and communities.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Is the platform really free?</AccordionTrigger>
              <AccordionContent>
                Yes! All courses on this platform are completely free. There are no hidden fees,
                enrollment costs, or subscription charges. Our mission is to make quality
                agricultural education accessible to everyone.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Who can enroll in courses?</AccordionTrigger>
              <AccordionContent>
                Anyone interested in sustainable agriculture can create an account and enroll in
                our courses. Our courses are designed for farmers, agricultural professionals,
                students, and anyone passionate about organic farming.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Do I need any prior knowledge?</AccordionTrigger>
              <AccordionContent>
                Most of our courses are designed for beginners and require no prior agricultural
                knowledge. Course descriptions will indicate if any prerequisites are needed for
                advanced courses.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Enrollment & Access */}
        <div className="mb-12">
          <h2 className="mb-6 font-bold text-2xl">Enrollment & Access</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-5">
              <AccordionTrigger>How do I enroll in a course?</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>Create a free account by clicking "Get Started"</li>
                  <li>Browse the course catalog</li>
                  <li>Click on a course you're interested in</li>
                  <li>Click "Enroll in Course" (some courses may require an enrollment code)</li>
                  <li>Start learning immediately!</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>What is an enrollment code?</AccordionTrigger>
              <AccordionContent>
                Some courses may require an enrollment code for access. These codes are provided
                by instructors or course coordinators. If you need an enrollment code, please
                contact the course instructor or DISOA administration.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger>Can I enroll in multiple courses?</AccordionTrigger>
              <AccordionContent>
                Yes! You can enroll in as many courses as you like. Learn at your own pace and
                explore different areas of sustainable agriculture.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger>Can I access courses on my mobile phone?</AccordionTrigger>
              <AccordionContent>
                Yes! Our platform is mobile-friendly and works on smartphones, tablets, and
                computers. You can learn anywhere, anytime with an internet connection.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Learning Experience */}
        <div className="mb-12">
          <h2 className="mb-6 font-bold text-2xl">Learning Experience</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-9">
              <AccordionTrigger>Are courses self-paced?</AccordionTrigger>
              <AccordionContent>
                Yes! All courses are self-paced, allowing you to learn on your own schedule. You
                can start and stop lessons as needed, and content remains available 24/7.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10">
              <AccordionTrigger>How long do I have access to a course?</AccordionTrigger>
              <AccordionContent>
                Once enrolled, you have unlimited access to course materials. You can revisit
                lessons and review content as many times as needed.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-11">
              <AccordionTrigger>Are there assessments or quizzes?</AccordionTrigger>
              <AccordionContent>
                Yes, courses include quizzes and assignments to help reinforce your learning and
                track your progress. These are designed to be practical and applicable to
                real-world farming situations.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-12">
              <AccordionTrigger>Can I get help if I have questions about course content?</AccordionTrigger>
              <AccordionContent>
                Yes! You can use the feedback feature within courses to ask questions or report
                issues. Instructors and administrators monitor feedback regularly.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Technical Support */}
        <div>
          <h2 className="mb-6 font-bold text-2xl">Technical Support</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-13">
              <AccordionTrigger>What if I forgot my password?</AccordionTrigger>
              <AccordionContent>
                Click on "Sign In" and then "Forgot your password?" to reset your password. You'll
                receive instructions via email.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-14">
              <AccordionTrigger>I'm having technical issues. Who can help?</AccordionTrigger>
              <AccordionContent>
                For technical support, please contact us through our contact page or email us at
                info@disoa.edu.ph. Include details about the issue you're experiencing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-15">
              <AccordionTrigger>What internet speed do I need?</AccordionTrigger>
              <AccordionContent>
                A stable internet connection is recommended. Most course content (text, images)
                works well even with slower connections. For video content, a faster connection
                will provide a better experience.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <Separator />

      {/* Still Have Questions */}
      <section className="bg-muted/30 py-12 sm:py-16">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <h2 className="mb-4 font-bold text-2xl sm:text-3xl">Still Have Questions?</h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
            Can't find the answer you're looking for? Please reach out to our team.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/contact">
              <Button size="lg">Contact Us</Button>
            </Link>
            <Link to="/c/courses">
              <Button size="lg" variant="outline">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}