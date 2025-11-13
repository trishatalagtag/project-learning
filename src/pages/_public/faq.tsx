import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import {
  AcademicCapIcon,
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/solid"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/_public/faq")({
  component: FAQPage,
})

function FAQPage() {
  return (
    <div className="mx-auto w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        {/* Background Cover Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/faq-hero.jpg"
            alt="DISOA FAQ Support"
            className="size-full object-cover object-center brightness-[0.4]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/50 to-primary/30 dark:from-primary/60 dark:via-primary/40 dark:to-primary/20" />
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto max-w-7xl px-4 py-16 sm:py-20 md:py-24 lg:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <QuestionMarkCircleIcon className="size-16 text-primary-foreground drop-shadow-sm sm:size-20 md:size-24" />
            </div>
            <h1 className="mb-4 font-bold text-3xl text-primary-foreground tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Frequently Asked Questions
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-primary-foreground/90 sm:text-xl">
              Find answers to common questions about DISOA's online learning platform
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* FAQ Sections */}
      <section className="container mx-auto max-w-7xl gap-4 px-4 py-12 sm:py-16">
        <ItemGroup className="space-y-4">
          {/* General Questions */}
          <Item asChild>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
              <ItemHeader>
                <ItemMedia variant="icon">
                  <ShieldCheckIcon className="size-8 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>General Questions</ItemTitle>
                  <ItemDescription>
                    Get started with basic information about DISOA and our platform
                  </ItemDescription>
                </ItemContent>
              </ItemHeader>
              <ItemContent className="px-6 pb-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <QuestionMarkCircleIcon className="size-4 text-primary" />
                        What is DISOA?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Item>
                        <ItemContent>
                          <ItemDescription>
                            DISOA (Dumingag Institute of Sustainable Organic Agriculture) is an agricultural
                            training institute that provides free, accessible education in sustainable and
                            organic farming practices to Filipino farmers and communities.
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="size-4 text-primary" />
                        Is the platform really free?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Item>
                        <ItemContent>
                          <ItemDescription>
                            Yes! All courses on this platform are completely free. There are no hidden fees,
                            enrollment costs, or subscription charges. Our mission is to make quality
                            agricultural education accessible to everyone.
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <UserPlusIcon className="size-4 text-primary" />
                        Who can enroll in courses?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Item>
                        <ItemContent>
                          <ItemDescription>
                            Anyone interested in sustainable agriculture can create an account and enroll in
                            our courses. Our courses are designed for farmers, agricultural professionals,
                            students, and anyone passionate about organic farming.
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <AcademicCapIcon className="size-4 text-primary" />
                        Do I need any prior knowledge?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Item>
                        <ItemContent>
                          <ItemDescription>
                            Most of our courses are designed for beginners and require no prior agricultural
                            knowledge. Course descriptions will indicate if any prerequisites are needed for
                            advanced courses.
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ItemContent>
            </div>
          </Item>

          {/* Enrollment & Access */}
          <Item asChild>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
              <ItemHeader>
                <ItemMedia variant="icon">
                  <BookOpenIcon className="size-8 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Enrollment & Access</ItemTitle>
                  <ItemDescription>
                    Learn how to create accounts, enroll in courses, and access materials
                  </ItemDescription>
                </ItemContent>
              </ItemHeader>
              <ItemContent className="px-6 pb-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-5">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <UserPlusIcon className="size-4 text-primary" />
                        How do I enroll in a course?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Item>
                        <ItemContent>
                          <ItemDescription>
                            <ol className="list-decimal space-y-2 pl-5">
                              <li>Create a free account by clicking "Get Started"</li>
                              <li>Browse the course catalog</li>
                              <li>Click on a course you're interested in</li>
                              <li>Click "Enroll in Course" (some courses may require an enrollment code)</li>
                              <li>Start learning immediately!</li>
                            </ol>
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="size-4 text-primary" />
                        What is an enrollment code?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Item>
                        <ItemContent>
                          <ItemDescription>
                            Some courses may require an enrollment code for access. These codes are provided
                            by instructors or course coordinators. If you need an enrollment code, please
                            contact the course instructor or DISOA administration.
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <BookOpenIcon className="size-4 text-primary" />
                        Can I enroll in multiple courses?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Item>
                        <ItemContent>
                          <ItemDescription>
                            Yes! You can enroll in as many courses as you like. Learn at your own pace and
                            explore different areas of sustainable agriculture.
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <RocketLaunchIcon className="size-4 text-primary" />
                        Can I access courses on my mobile phone?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Item>
                        <ItemContent>
                          <ItemDescription>
                            Yes! Our platform is mobile-friendly and works on smartphones, tablets, and
                            computers. You can learn anywhere, anytime with an internet connection.
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ItemContent>
            </div>
          </Item>

          {/* Learning Experience */}
          <Item asChild>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
              <ItemHeader>
                <ItemMedia variant="icon">
                  <AcademicCapIcon className="size-8 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Learning Experience</ItemTitle>
                  <ItemDescription>
                    Understand how our courses work and what to expect
                  </ItemDescription>
                </ItemContent>
              </ItemHeader>
              <ItemContent className="px-6 pb-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-9">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="size-4 text-primary" />
                        Are courses self-paced?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Item>
                        <ItemContent>
                          <ItemDescription>
                            Yes! All courses are self-paced, allowing you to learn on your own schedule. You
                            can start and stop lessons as needed, and content remains available 24/7.
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-10">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <BookOpenIcon className="size-4 text-primary" />
                        How long do I have access to a course?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Item>
                        <ItemContent>
                          <ItemDescription>
                            Once enrolled, you have unlimited access to course materials. You can revisit
                            lessons and review content as many times as needed.
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-11">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <AcademicCapIcon className="size-4 text-primary" />
                        Are there assessments or quizzes?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Item>
                        <ItemContent>
                          <ItemDescription>
                            Yes, courses include quizzes and assignments to help reinforce your learning and
                            track your progress. These are designed to be practical and applicable to
                            real-world farming situations.
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-12">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <ChatBubbleBottomCenterTextIcon className="size-4 text-primary" />
                        Can I get help if I have questions about course content?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Item>
                        <ItemContent>
                          <ItemDescription>
                            Yes! You can use the feedback feature within courses to ask questions or report
                            issues. Instructors and administrators monitor feedback regularly.
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ItemContent>
            </div>
          </Item>

          {/* Technical Support */}
          <Item asChild>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
              <ItemHeader>
                <ItemMedia variant="icon">
                  <WrenchScrewdriverIcon className="size-8 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Technical Support</ItemTitle>
                  <ItemDescription>
                    Get help with login issues, browser compatibility, and technical problems
                  </ItemDescription>
                </ItemContent>
              </ItemHeader>
              <ItemContent className="px-6 pb-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-13">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="size-4 text-primary" />
                        What if I forgot my password?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Item>
                        <ItemContent>
                          <ItemDescription>
                            Click on "Sign In" and then "Forgot your password?" to reset your password. You'll
                            receive instructions via email.
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-14">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <WrenchScrewdriverIcon className="size-4 text-primary" />
                        I'm having technical issues. Who can help?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Item>
                        <ItemContent>
                          <ItemDescription>
                            For technical support, please contact us through our contact page or email us at
                            info@disoa.edu.ph. Include details about the issue you're experiencing.
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-15">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <RocketLaunchIcon className="size-4 text-primary" />
                        What internet speed do I need?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Item>
                        <ItemContent>
                          <ItemDescription>
                            A stable internet connection is recommended. Most course content (text, images)
                            works well even with slower connections. For video content, a faster connection
                            will provide a better experience.
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ItemContent>
            </div>
          </Item>
        </ItemGroup>

        {/* Contact CTA */}
        <div className="mt-12 rounded-lg border bg-muted/50 p-8 text-center">
          <h2 className="mb-4 font-bold text-2xl">Need More Help?</h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
            Our support team is here to assist you with any questions not covered in our FAQ.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/contact">
              <Button size="lg">
                <EnvelopeIcon className="mr-2 size-5" />
                Contact Support
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="lg" variant="outline">
                <BookOpenIcon className="mr-2 size-5" />
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}