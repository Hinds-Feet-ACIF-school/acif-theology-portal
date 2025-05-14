import React from 'react';

const TermsOfUsePage: React.FC = () => {
  const deepBrown = 'text-[#2A0F0F] dark:text-[#FFF8F0]';
  const midBrown = 'text-[#4A1F1F] dark:text-[#E0D6C3]';
  const lightBg = 'bg-[#FFF8F0]';
  const darkBg = 'dark:bg-gray-950';

  const effectiveDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={`flex flex-col min-h-screen ${lightBg} ${darkBg}`}>
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 lg:py-28">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight ${deepBrown} font-serif mb-6 text-center`}>
            Terms of Use
          </h1>
          <p className={`${midBrown} text-center mb-10 text-sm`}>
            Effective Date: {effectiveDate}
          </p>

          <div className={`space-y-6 ${midBrown} leading-relaxed`}>
            <p>
              Welcome to the{' '}
              <strong>Certificate in Apostolic and Evangelical Theology</strong>{' '}
              program (the "Program") offered by the{' '}
              <strong>International Apostolic Church Online Theology School</strong>{' '}
              (referred to as "we," "us," "our," or the "School"). These Terms
              of Use ("Terms") govern your access to and use of our online
              Learning Management System (LMS), course materials, discussion
              forums, and all related services (collectively, the "Service").
            </p>
            <p>
              By enrolling in, accessing, or using the Service, you agree to
              be bound by these Terms and our Privacy Policy. If you do not
              agree to these Terms, you may not use the Service.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              1. Program Description
            </h2>
            <p>
              The Certificate in Apostolic and Evangelical Theology is a
              6-month online program designed to provide a strong foundation in
              core Christian doctrines, Bible study, Apostolic teachings, and
              spiritual disciplines. It comprises 6 courses, each lasting 4
              weeks, with each course valued at 6.5 ECTS credits (total 39
              ECTS). The Program is delivered 100% online, including video
              lectures, PDF readings, quizzes, and assignments, requiring
              approximately 10-12 hours of study per week.
            </p>
            <p>Courses include:</p>
            <ol className="list-decimal list-inside space-y-1 pl-4">
              <li>Foundations of the Christian Faith</li>
              <li>The Bible: God’s Word</li>
              <li>Apostolic Doctrine</li>
              <li>Spiritual Growth and Christian Living</li>
              <li>Introduction to Evangelism</li>
              <li>Church Life and Service</li>
            </ol>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              2. Student Eligibility and Accounts
            </h2>
            <p>
              Enrollment is open to new believers, ministry volunteers, and
              lay leaders seeking to grow in their faith and calling. You must
              provide accurate and complete information during enrollment and
              keep your account details updated. You are responsible for
              maintaining the confidentiality of your account credentials and
              for all activities under your account.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              3. Code of Conduct and Student Expectations
            </h2>
            <p>
              Students are expected to:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                Uphold Christian character in all interactions within the
                Program.
              </li>
              <li>
                Submit original work for all assignments and assessments.
                Plagiarism or any form of academic dishonesty is strictly
                prohibited and may result in disciplinary action, including
                dismissal from the Program.
              </li>
              <li>
                Engage respectfully and constructively with peers, faculty,
                and mentors in online discussions and all communications.
              </li>
              <li>Complete all assignments and assessments by the specified deadlines.</li>
              <li>Participate actively in online discussions as required by each course.</li>
              <li>Maintain academic integrity and honesty in all aspects of the Program.</li>
            </ul>
            <p>
              Failure to adhere to this Code of Conduct may result in
              corrective actions, up to and including removal from the Program
              without refund.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              4. Assessments and Grading
            </h2>
            <p>
              Student performance is assessed through weekly assignments,
              quizzes, final written or video projects, and group discussions.
              Grading will be based on the Assessment Rubrics provided (Written
              Assignment Rubric, Final Project Rubric, Discussion Participation
              Rubric) and the following scale:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>90–100%: Excellent</li>
              <li>80–89%: Very Good</li>
              <li>70–79%: Good</li>
              <li>60–69%: Satisfactory</li>
              <li>Below 60%: Unsatisfactory / Repeat Required (work may need to be resubmitted or assessment retaken as per instructor guidance)</li>
            </ul>
            <p>Instructors will apply these rubrics to ensure fairness and consistency.</p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              5. Intellectual Property
            </h2>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>Our Content:</strong> All course materials provided by
                the School, including video lectures, PDFs, and Program
                structure, are the intellectual property of the International
                Apostolic Church or its licensors and are provided for your
                personal, non-commercial educational use within the Program
                only. You may not reproduce, distribute, or create derivative
                works from these materials without prior written permission.
              </li>
              <li>
                <strong>Your Content:</strong> You retain ownership of the
                original work you submit (e.g., essays, projects). By
                submitting your work, you grant the School a non-exclusive,
                royalty-free license to use, reproduce, and display your work
                for the purposes of grading, providing feedback, and
                administering the Program.
              </li>
            </ul>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              6. Support
            </h2>
            <p>
              Academic and spiritual mentoring is available via scheduled
              online sessions. Technical support for the LMS platform is
              provided through the designated support channel within the
              platform. For general questions, contact the School Administrator
              at [email@email.com] or through the LMS messaging system.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              7. Certification
            </h2>
            <p>
              Upon successful completion of all six courses, including all
              required assessments, and adherence to the Program's Code of
              Conduct, students will be awarded the Certificate in Apostolic
              and Evangelical Theology (39 ECTS) by the International
              Apostolic Church.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              8. Disclaimers
            </h2>
            <p>
              The Service is provided "as is" and "as available." While we
              strive to provide high-quality educational content, we make no
              warranties regarding the uninterrupted or error-free operation
              of the LMS or the specific outcomes from your participation,
              beyond the learning objectives stated. The theological views
              expressed are those of the International Apostolic Church. This
              Program is for educational and spiritual enrichment and does not
              constitute professional ministerial licensing or ordination by
              default, unless otherwise specified by the International
              Apostolic Church of Ethiopia.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              9. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, the School shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, or any loss of profits or revenues, whether
              incurred directly or indirectly, or any loss of data, use,
              goodwill, or other intangible losses, resulting from your access
              to or use of or inability to access or use the Service.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              10. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your access to the
              Service at any time, without prior notice or liability, for
              conduct that violates these Terms, including the Code of Conduct,
              or for any other reason deemed necessary to protect the integrity
              of the Program or the safety of its participants.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              11. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of Ethiopia, without regard to its conflict of law
              provisions, as the Program is offered by the International
              Apostolic Church of Ethiopia.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              12. Changes to These Terms
            </h2>
            <p>
              We reserve the right, at our sole discretion, to modify or
              replace these Terms at any time. If a revision is material, we
              will provide at least 30 days' notice prior to any new terms
              taking effect. What constitutes a material change will be
              determined at our sole discretion. Your continued use of the
              Service after any such changes constitutes your acceptance of the
              new Terms.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              13. Contact Information
            </h2>
            <p>
              For questions or help regarding these Terms or any other aspect
              of the Program, please contact the School Administrator at:
              <br />
              <strong>Email:</strong> [email@email.com]
              <br />
              Or through the LMS messaging system.
            </p>
            <p className="mt-6">
              <em>
                This program is offered by the International Apostolic Church
                of Ethiopia as part of its mission to equip believers for life
                and ministry in Christ.
              </em>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUsePage;