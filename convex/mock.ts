import { faker } from "@faker-js/faker";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";

/**
/**
 * Default Better Auth user IDs (strings). You can override via args when running.
 * Tip: Paste your real Better Auth user IDs here, or pass via npx convex run mock:createFake --args '{ "adminId": "xxx", ... }'
 */
const DEFAULT_ADMIN_ID = "jd7bn0q8mhmtywa72v530hww3d7ts0q4"
const DEFAULT_FACULTY_ID = "jd77r0n8y3gxf3wyjvmbdw1qh57tsevc"
const DEFAULT_LEARNER_ID = "jd723cfcgw174980x695nykg7n7trdhb"

/**
 * Create realistic mock data across the schema.
 */
export const createFake = internalMutation({
  args: {
    // Optional overrides
    seed: v.optional(v.number()),
    adminId: v.optional(v.string()),
    facultyId: v.optional(v.string()),
    learnerId: v.optional(v.string()),

    // Size knobs (keep small for fast runs)
    l1Count: v.optional(v.number()), // top-level categories
    l2PerL1: v.optional(v.number()),
    l3PerL2: v.optional(v.number()),

    coursesPerCat: v.optional(v.number()),
    modulesPerCourse: v.optional(v.number()),
    lessonsPerModule: v.optional(v.number()),

    guidesPerLesson: v.optional(v.number()),
    quizzesPerCourse: v.optional(v.number()),
    questionsPerQuiz: v.optional(v.number()),
    assignmentsPerCourse: v.optional(v.number()),

    // Toggle media attachments requiring _storage files (off by default)
    createMediaAttachments: v.optional(v.boolean()),
  },
  returns: v.object({
    categories: v.object({ level1: v.number(), level2: v.number(), level3: v.number() }),
    courses: v.number(),
    modules: v.number(),
    lessons: v.number(),
    guides: v.number(),
    guideSteps: v.number(),
    quizzes: v.number(),
    quizQuestions: v.number(),
    assignments: v.number(),
    enrollments: v.number(),
    lessonProgress: v.number(),
    guideProgress: v.number(),
    quizAttempts: v.number(),
    assignmentSubmissions: v.number(),
    announcements: v.number(),
    feedback: v.number(),
    coursePerformance: v.number(),
  }),
  handler: async (ctx, args) => {
    // Setup
    const seed = args.seed ?? Date.now();
    faker.seed(seed);

    const ADMIN_ID = args.adminId ?? DEFAULT_ADMIN_ID;
    const FACULTY_ID = args.facultyId ?? DEFAULT_FACULTY_ID;
    const LEARNER_ID = args.learnerId ?? DEFAULT_LEARNER_ID;

    // Sizes (reasonable defaults)
    const l1Count = Math.max(1, args.l1Count ?? 2);
    const l2PerL1 = Math.max(1, args.l2PerL1 ?? 2);
    const l3PerL2 = Math.max(1, args.l3PerL2 ?? 1);

    const coursesPerCat = Math.max(1, args.coursesPerCat ?? 2);
    const modulesPerCourse = Math.max(1, args.modulesPerCourse ?? 2);
    const lessonsPerModule = Math.max(1, args.lessonsPerModule ?? 3);

    const guidesPerLesson = Math.max(0, args.guidesPerLesson ?? 1);
    const quizzesPerCourse = Math.max(0, args.quizzesPerCourse ?? 1);
    const questionsPerQuiz = Math.max(1, args.questionsPerQuiz ?? 5);
    const assignmentsPerCourse = Math.max(0, args.assignmentsPerCourse ?? 1);

    const createMediaAttachments = args.createMediaAttachments ?? false; // Off by default

    // Counters
    let level1 = 0, level2 = 0, level3 = 0;
    let coursesCt = 0, modulesCt = 0, lessonsCt = 0;
    let guidesCt = 0, guideStepsCt = 0;
    let quizzesCt = 0, quizQuestionsCt = 0;
    let assignmentsCt = 0;
    let enrollmentsCt = 0;
    let lessonProgressCt = 0, guideProgressCt = 0;
    let quizAttemptsCt = 0, assignmentSubsCt = 0;
    let announcementsCt = 0;
    let feedbackCt = 0;
    let coursePerfCt = 0;

    // Helper
    const now = () => Date.now();

    // 1) Categories (3 levels)
    const catLevel1: Id<"categories">[] = [];
    const catLevel2ByL1 = new Map<Id<"categories">, Id<"categories">[]>();
    const catLevel3ByL2 = new Map<Id<"categories">, Id<"categories">[]>();

    for (let i = 0; i < l1Count; i++) {
      const id = await ctx.db.insert("categories", {
        name: faker.commerce.department() + " (L1)",
        description: faker.commerce.productDescription(),
        parentId: undefined,
        level: 1,
        order: i,
        createdAt: now(),
      });
      catLevel1.push(id);
      level1++;
    }

    for (const parentId of catLevel1) {
      const children: Id<"categories">[] = [];
      for (let i = 0; i < l2PerL1; i++) {
        const id = await ctx.db.insert("categories", {
          name: faker.word.words({ count: { min: 1, max: 2 } }) + " (L2)",
          description: faker.commerce.productDescription(),
          parentId,
          level: 2,
          order: i,
          createdAt: now(),
        });
        level2++;
        children.push(id);
      }
      catLevel2ByL1.set(parentId, children);
    }

    for (const [l1, l2List] of catLevel2ByL1.entries()) {
      for (const l2 of l2List) {
        const childrenL3: Id<"categories">[] = [];
        for (let i = 0; i < l3PerL2; i++) {
          const id = await ctx.db.insert("categories", {
            name: faker.word.words({ count: { min: 1, max: 2 } }) + " (L3)",
            description: faker.commerce.productDescription(),
            parentId: l2,
            level: 3,
            order: i,
            createdAt: now(),
          });
          level3++;
          childrenL3.push(id);
        }
        catLevel3ByL2.set(l2, childrenL3);
      }
    }

    // 2) Courses (published for usability)
    // Use only level3 categories if available, else fall back to level2 or level1
    const catTargets: Id<"categories">[] =
      level3 > 0
        ? Array.from(catLevel3ByL2.values()).flat()
        : level2 > 0
          ? Array.from(catLevel2ByL1.values()).flat()
          : catLevel1;

    const courseIds: Id<"courses">[] = [];
    for (const categoryId of catTargets) {
      for (let c = 0; c < coursesPerCat; c++) {
        const courseTitle = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} in ${faker.commerce.department()}`;
        const courseId = await ctx.db.insert("courses", {
          title: courseTitle,
          description: faker.lorem.sentences({ min: 2, max: 3 }),
          content: faker.lorem.paragraphs({ min: 2, max: 4 }),
          categoryId,
          teacherId: FACULTY_ID, // teacher assignment
          coverImageId: undefined, // no real storage in mock
          status: "published",
          enrollmentCode: faker.string.alphanumeric({ length: 6 }).toUpperCase(),
          isEnrollmentOpen: true,
          gradingConfig: {
            passingScore: 85,
            gradingMethod: "numerical",
          },
          createdAt: now(),
          updatedAt: now(),
          createdBy: ADMIN_ID,
        });
        courseIds.push(courseId);
        coursesCt++;

        // Announcements (course-level)
        const annCount = faker.number.int({ min: 1, max: 2 });
        for (let a = 0; a < annCount; a++) {
          await ctx.db.insert("announcements", {
            courseId,
            authorId: FACULTY_ID,
            title: faker.lorem.words({ min: 3, max: 5 }),
            content: faker.lorem.paragraph(),
            isPinned: a === 0,
            createdAt: now(),
            updatedAt: now(),
          });
          announcementsCt++;
        }
      }
    }

    // Global announcement
    await ctx.db.insert("announcements", {
      courseId: undefined,
      authorId: ADMIN_ID,
      title: "Welcome to the Sustainable Agriculture Platform",
      content: "This is a global announcement for all users.",
      isPinned: true,
      createdAt: now(),
      updatedAt: now(),
    });
    announcementsCt++;

    // 3) Modules, Lessons
    const moduleIdsByCourse = new Map<Id<"courses">, Id<"modules">[]>();
    const lessonIdsByCourse = new Map<Id<"courses">, Id<"lessons">[]>();
    const lessonIdsByModule = new Map<Id<"modules">, Id<"lessons">[]>();

    for (const courseId of courseIds) {
      const modules: Id<"modules">[] = [];
      for (let m = 0; m < modulesPerCourse; m++) {
        const moduleId = await ctx.db.insert("modules", {
          courseId,
          title: `${faker.word.noun()} Module`,
          description: faker.lorem.sentence(),
          content: faker.lorem.paragraph(),
          order: m,
          status: "approved",
          createdAt: now(),
          updatedAt: now(),
          createdBy: FACULTY_ID,
        });
        modules.push(moduleId);
        modulesCt++;

        const lessons: Id<"lessons">[] = [];
        for (let l = 0; l < lessonsPerModule; l++) {
          const lessonId = await ctx.db.insert("lessons", {
            moduleId,
            title: `${faker.word.adjective()} Lesson ${l + 1}`,
            description: faker.lorem.sentence(),
            content: faker.lorem.paragraphs({ min: 1, max: 2 }),
            order: l,
            status: "approved",
            createdAt: now(),
            updatedAt: now(),
            createdBy: FACULTY_ID,
          });
          lessons.push(lessonId);
          lessonsCt++;
        }
        lessonIdsByModule.set(moduleId, lessons);
      }
      moduleIdsByCourse.set(courseId, modules);
      lessonIdsByCourse.set(courseId, modules.flatMap((m) => lessonIdsByModule.get(m) ?? []));
    }

    // 4) Lesson Attachments (mockable: guides and links to quiz/assignment)
    // For media attachments requiring storage, we ONLY generate if createMediaAttachments is true
    type GuideAttachment = Id<"lessonAttachments">;
    const guideByLesson = new Map<Id<"lessons">, GuideAttachment[]>();

    for (const [courseId, lessons] of lessonIdsByCourse.entries()) {
      for (const lessonId of lessons) {
        let ord = 0;

        // Optional media attachment placeholders (skipped by default)
        if (createMediaAttachments && faker.datatype.boolean()) {
          // WARN: These fileIds won't exist unless you upload files first.
          // Add your own _storage Ids before enabling, or handle gracefully in app.
          // await ctx.db.insert("lessonAttachments", {
          //   type: "video",
          //   lessonId,
          //   order: ord++,
          //   title: "Demo Video",
          //   description: "Placeholder (no real file)",
          //   fileId: "SOME_STORAGE_ID" as Id<"_storage">,
          // } as any);
        }

        // Guides
        for (let g = 0; g < guidesPerLesson; g++) {
          const guideId = await ctx.db.insert("lessonAttachments", {
            type: "guide",
            lessonId,
            order: ord++,
            title: `${faker.word.verb()} Guide`,
            description: faker.lorem.sentence(),
            introduction: faker.lorem.paragraph(),
            conclusion: faker.lorem.sentence(),
          } as any);
          guidesCt++;
          const existing = guideByLesson.get(lessonId) ?? [];
          existing.push(guideId);
          guideByLesson.set(lessonId, existing);

          // guide steps (3–6)
          const steps = faker.number.int({ min: 3, max: 6 });
          for (let s = 1; s <= steps; s++) {
            await ctx.db.insert("guideSteps", {
              guideId,
              stepNumber: s,
              title: `${faker.word.verb()} ${faker.word.noun()}`,
              content: faker.lorem.paragraph(),
              imageId: undefined, // no storage in mock
              createdAt: now(),
            });
            guideStepsCt++;
          }
        }
      }
    }

    // 5) Quizzes (published)
    const quizIdsByCourse = new Map<Id<"courses">, Id<"quizzes">[]>();
    for (const courseId of courseIds) {
      const quizzes: Id<"quizzes">[] = [];
      for (let q = 0; q < quizzesPerCourse; q++) {
        // Randomly link to a lesson or module (same course)
        const linkToLesson = faker.datatype.boolean();
        const modules = moduleIdsByCourse.get(courseId) ?? [];
        const lessons = lessonIdsByCourse.get(courseId) ?? [];

        const linkedToLessonId = linkToLesson && lessons.length ? faker.helpers.arrayElement(lessons) : undefined;
        const linkedToModuleId = !linkToLesson && modules.length ? faker.helpers.arrayElement(modules) : undefined;

        const quizId = await ctx.db.insert("quizzes", {
          courseId,
          title: `${faker.word.adjective()} Quiz`,
          description: faker.lorem.sentence(),
          instructions: faker.lorem.sentences({ min: 1, max: 2 }),
          linkedToLessonId,
          linkedToModuleId,
          allowMultipleAttempts: faker.datatype.boolean(),
          maxAttempts: faker.datatype.boolean() ? faker.number.int({ min: 1, max: 3 }) : undefined,
          timeLimitMinutes: faker.datatype.boolean() ? faker.number.int({ min: 10, max: 45 }) : undefined,
          dueDate: faker.datatype.boolean() ? now() + faker.number.int({ min: 1, max: 14 }) * 86400000 : undefined,
          availableFrom: undefined,
          availableUntil: undefined,
          gradingMethod: faker.helpers.arrayElement(["latest", "highest", "average"] as const),
          showCorrectAnswers: true,
          shuffleQuestions: faker.datatype.boolean(),
          passingScore: 70,
          status: "published",
          createdAt: now(),
          updatedAt: now(),
          createdBy: FACULTY_ID,
        });
        quizzesCt++;
        quizzes.push(quizId);

        // Questions
        for (let i = 0; i < questionsPerQuiz; i++) {
          const options = [
            faker.commerce.productAdjective(),
            faker.commerce.productAdjective(),
            faker.commerce.productAdjective(),
            faker.commerce.productAdjective(),
          ];
          const correctIndex = faker.number.int({ min: 0, max: options.length - 1 });
          await ctx.db.insert("quizQuestions", {
            quizId,
            order: i + 1,
            type: "multiple-choice",
            questionText: faker.lorem.sentence(),
            options,
            correctIndex,
            points: faker.number.int({ min: 1, max: 3 }),
            explanation: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
          });
          quizQuestionsCt++;
        }
      }
      quizIdsByCourse.set(courseId, quizzes);
    }

    // 6) Assignments (published, text submissions)
    const assignmentIdsByCourse = new Map<Id<"courses">, Id<"assignments">[]>();
    for (const courseId of courseIds) {
      const assignments: Id<"assignments">[] = [];
      for (let a = 0; a < assignmentsPerCourse; a++) {
        const modules = moduleIdsByCourse.get(courseId) ?? [];
        const lessons = lessonIdsByCourse.get(courseId) ?? [];

        const linkedToLessonId = lessons.length && faker.datatype.boolean()
          ? faker.helpers.arrayElement(lessons)
          : undefined;
        const linkedToModuleId =
          !linkedToLessonId && modules.length && faker.datatype.boolean()
            ? faker.helpers.arrayElement(modules)
            : undefined;

        const assignmentId = await ctx.db.insert("assignments", {
          courseId,
          title: `${faker.word.adjective()} Assignment`,
          description: faker.lorem.sentences({ min: 1, max: 2 }),
          instructions: faker.lorem.sentences({ min: 1, max: 3 }),
          linkedToLessonId,
          linkedToModuleId,
          submissionType: "text",
          allowedFileTypes: undefined,
          maxFileSize: undefined,
          allowMultipleAttempts: faker.datatype.boolean(),
          maxAttempts: undefined,
          dueDate: faker.datatype.boolean() ? now() + faker.number.int({ min: 1, max: 10 }) * 86400000 : undefined,
          availableFrom: undefined,
          availableUntil: undefined,
          allowLateSubmissions: true,
          lateSubmissionPenalty: 10,
          maxPoints: 100,
          status: "published",
          createdAt: now(),
          updatedAt: now(),
          createdBy: FACULTY_ID,
        });
        assignmentsCt++;
        assignments.push(assignmentId);
      }
      assignmentIdsByCourse.set(courseId, assignments);
    }

    // 7) Enroll learner in all courses
    for (const courseId of courseIds) {
      await ctx.db.insert("enrollments", {
        userId: LEARNER_ID,
        courseId,
        status: "active",
        enrolledAt: now(),
        completedAt: undefined,
      });
      enrollmentsCt++;
    }

    // 8) Lesson progress + guide progress for learner
    for (const [courseId, lessons] of lessonIdsByCourse.entries()) {
      for (const lessonId of lessons) {
        const completed = faker.datatype.boolean();
        await ctx.db.insert("lessonProgress", {
          userId: LEARNER_ID,
          lessonId,
          completed,
          completedAt: completed ? now() : undefined,
          lastViewedAt: now(),
        });
        lessonProgressCt++;

        const guides = guideByLesson.get(lessonId) ?? [];
        for (const guideId of guides) {
          // Count steps for guide
          // For simplicity, count ~3–6 (same as above)
          const totalSteps = faker.number.int({ min: 3, max: 6 });
          const completedStepsArr =
            faker.datatype.boolean()
              ? Array.from({ length: faker.number.int({ min: 1, max: totalSteps }) }, (_, i) => i + 1)
              : [];
          const isComplete = completedStepsArr.length === totalSteps;

          await ctx.db.insert("guideProgress", {
            userId: LEARNER_ID,
            guideId,
            completedSteps: completedStepsArr,
            totalSteps,
            lastViewedStep: completedStepsArr[completedStepsArr.length - 1] ?? 1,
            completed: isComplete,
            completedAt: isComplete ? now() : undefined,
          });
          guideProgressCt++;
        }
      }
    }

    // 9) Quiz attempts (one per quiz)
    for (const [courseId, quizList] of quizIdsByCourse.entries()) {
      for (const quizId of quizList) {
        // fetch questions
        const questions = await ctx.db
          .query("quizQuestions")
          .withIndex("by_quiz", (q) => q.eq("quizId", quizId))
          .collect();

        let score = 0;
        let maxScore = 0;
        const answers: { questionId: Id<"quizQuestions">; selectedIndex: number }[] = [];
        for (const q of questions) {
          maxScore += q.points;
          const correct = faker.datatype.boolean();
          const selectedIndex = correct ? q.correctIndex : faker.number.int({ min: 0, max: q.options.length - 1 });
          if (selectedIndex === q.correctIndex) score += q.points;
          answers.push({ questionId: q._id, selectedIndex });
        }

        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

        await ctx.db.insert("quizAttempts", {
          userId: LEARNER_ID,
          quizId,
          attemptNumber: 1,
          answers,
          score,
          maxScore,
          percentage,
          passed: percentage >= 70,
          startedAt: now() - faker.number.int({ min: 30, max: 600 }) * 1000,
          submittedAt: now(),
          timeSpentSeconds: faker.number.int({ min: 30, max: 600 }),
        });
        quizAttemptsCt++;
      }
    }

    // 10) Assignment submissions (one per assignment, graded)
    for (const [courseId, assignmentList] of assignmentIdsByCourse.entries()) {
      for (const assignmentId of assignmentList) {
        const grade = faker.number.int({ min: 60, max: 98 });
        await ctx.db.insert("assignmentSubmissions", {
          userId: LEARNER_ID,
          assignmentId,
          attemptNumber: 1,
          submissionType: "text",
          fileId: undefined,
          url: undefined,
          textContent: faker.lorem.paragraph(),
          status: "graded",
          submittedAt: now(),
          grade,
          teacherFeedback: faker.lorem.sentence(),
          gradedAt: now(),
          gradedBy: FACULTY_ID,
          isLate: faker.datatype.boolean(),
          createdAt: now(),
        });
        assignmentSubsCt++;
      }
    }

    // 11) Feedback (learner)
    for (const courseId of courseIds) {
      await ctx.db.insert("learnerFeedback", {
        userId: LEARNER_ID,
        targetType: "course",
        targetId: courseId as unknown as string,
        feedbackType: "suggestion",
        message: faker.lorem.sentence(),
        status: "open",
        resolvedBy: undefined,
        resolvedAt: undefined,
        createdAt: now(),
      });
      feedbackCt++;
    }

    // 12) Course performance (optional mock). Here we derive a simple snapshot.
    // If you decide to compute on-the-fly, you can remove this block.
    for (const courseId of courseIds) {
      const lessons = lessonIdsByCourse.get(courseId) ?? [];
      const quizzes = quizIdsByCourse.get(courseId) ?? [];
      const assignments = assignmentIdsByCourse.get(courseId) ?? [];

      // naive ratios using above inserts
      const completedLessons = Math.floor((2 * lessons.length) / 3);
      const averageQuizScore = faker.number.float({ min: 50, max: 95 });
      const averageAssignmentScore = faker.number.float({ min: 60, max: 98 });
      const overallScore = (averageQuizScore + averageAssignmentScore) / 2;

      await ctx.db.insert("coursePerformance", {
        userId: LEARNER_ID,
        courseId,
        totalLessons: lessons.length,
        completedLessons,
        totalQuizzes: quizzes.length,
        completedQuizzes: quizzes.length, // one attempt per quiz
        averageQuizScore,
        totalAssignments: assignments.length,
        completedAssignments: assignments.length,
        averageAssignmentScore,
        overallScore,
        isComplete: overallScore >= 85,
        lastUpdated: now(),
      });
      coursePerfCt++;
    }

    return {
      categories: { level1, level2, level3 },
      courses: coursesCt,
      modules: modulesCt,
      lessons: lessonsCt,
      guides: guidesCt,
      guideSteps: guideStepsCt,
      quizzes: quizzesCt,
      quizQuestions: quizQuestionsCt,
      assignments: assignmentsCt,
      enrollments: enrollmentsCt,
      lessonProgress: lessonProgressCt,
      guideProgress: guideProgressCt,
      quizAttempts: quizAttemptsCt,
      assignmentSubmissions: assignmentSubsCt,
      announcements: announcementsCt,
      feedback: feedbackCt,
      coursePerformance: coursePerfCt,
    };
  },
});