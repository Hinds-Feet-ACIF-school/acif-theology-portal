import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
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
            Privacy Policy
          </h1>
          <p className={`${midBrown} text-center mb-10 text-sm`}>
            Effective Date: {effectiveDate}
          </p>

          <div className={`space-y-6 ${midBrown} leading-relaxed`}>
            <p>
              This Privacy Policy outlines how the{' '}
              <strong>International Apostolic Church Online Theology School</strong>{' '}
              (referred to as "we," "us," "our," or the "School") collects,
              uses, maintains, and discloses information collected from students
              (each, a "Student") enrolled in the{' '}
              <strong>
                Certificate in Apostolic and Evangelical Theology
              </strong>{' '}
              program (the "Program") offered through our online Learning
              Management System (LMS) and associated platforms. This policy applies to the Program and all
              services offered by the School.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              1. Information We Collect
            </h2>
            <p>
              We may collect personal identification information from Students
              in various ways, including, but not limited to, when Students
              enroll in the Program, submit assignments, participate in
              discussions, or interact with Program resources and support
              channels. We may collect the following types of information:
            </p>
            <ul className="list-disc list-inside space-y-3 pl-4">
              <li>
                <strong>Enrollment Information:</strong> Name, email address,
                contact details, and any other information required for
                registration and administration in the Program.
              </li>
              <li>
                <strong>Academic Submissions:</strong> Coursework, including
                essays, reflections, case studies, weekly assignments, quizzes,
                final written or video projects (such as sermons, ministry
                plans, testimonies), and any other materials submitted for
                assessment.
              </li>
              <li>
                <strong>Participation Data:</strong> Contributions to online
                discussion forums, group discussions, reflections, and
                interactions with peers and faculty.
              </li>
              <li>
                <strong>Communication Records:</strong> Records of communications
                with academic and spiritual mentors, technical support staff,
                and the School Administrator via the LMS messaging system or
                email ([email@email.com]).
              </li>
              <li>
                <strong>Progress and Performance Data:</strong> Information
                related to your academic progress, grades, assessment outcomes,
                and completion status for courses and the Program.
              </li>
              <li>
                <strong>Technical Data:</strong> IP address, browser type,
                operating system, and usage data related to your interaction
                with our online learning platform, collected to ensure platform
                functionality and security.
              </li>
            </ul>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              2. How We Use Collected Information
            </h2>
            <p>
              The School may collect and use Students' personal information
              for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>To Administer the Program:</strong> To manage
                enrollment, deliver course content, track academic progress,
                and facilitate the overall learning experience.
              </li>
              <li>
                <strong>To Assess Student Performance:</strong> To evaluate
                assignments, quizzes, projects, and participation according to
                the Program's assessment rubrics and grading scale, and to
                provide feedback.
              </li>
              <li>
                <strong>To Provide Support:</strong> To offer academic and
                spiritual mentoring, technical assistance through the platform
                support channel, and respond to inquiries sent to the School
                Administrator.
              </li>
              <li>
                <strong>To Communicate with Students:</strong> To send important
                updates about the Program, course information, notifications,
                and responses to student queries.
              </li>
              <li>
                <strong>To Improve Our Program:</strong> To analyze usage patterns
                and feedback to enhance course content, delivery methods, and
                student support services.
              </li>
              <li>
                <strong>To Issue Certification:</strong> To verify completion of
                Program requirements and issue the Certificate in Apostolic and
                Evangelical Theology.
              </li>
              <li>
                <strong>To Uphold Our Code of Conduct:</strong> To ensure a
                respectful and integral learning environment for all
                participants.
              </li>
              <li>
                <strong>For Record Keeping:</strong> To maintain academic records
                as required for educational and administrative purposes.
              </li>
            </ul>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              3. How We Protect Your Information
            </h2>
            <p>
              We adopt appropriate data collection, storage, and processing
              practices, and security measures to protect against unauthorized
              access, alteration, disclosure, or destruction of your personal
              information, username, password, transaction information, and
              data stored on our platform. Sensitive and private data exchange
              between the Student and the platform happens over an SSL secured
              communication channel where possible.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              4. Sharing Your Personal Information
            </h2>
            <p>
              We do not sell, trade, or rent Students' personal identification
              information to others. We may share information as follows:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>With Instructors and Mentors:</strong> Information
                necessary for teaching, assessment, and mentoring within the
                Program.
              </li>
              <li>
                <strong>With the International Apostolic Church of Ethiopia:</strong>
                Information required for administrative oversight, certification,
                and fulfillment of the Church's mission to equip believers.
              </li>
              <li>
                <strong>With Third-Party Service Providers:</strong> We may use
                third-party service providers (e.g., LMS platform provider) to
                help us operate our Program. These providers are bound by
                confidentiality agreements and are only permitted to use your
                information to provide services to us.
              </li>
              <li>
                <strong>For Legal Compliance:</strong> If required by law or in
                response to valid legal processes, we may disclose your
                information.
              </li>
            </ul>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              5. Data Retention
            </h2>
            <p>
              We will retain your personal information for as long as necessary
              to fulfill the purposes outlined in this Privacy Policy, to provide
              you with the Program services, to maintain academic records, and
              to comply with our legal obligations.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              6. Your Rights
            </h2>
            <p>
              You have the right to access, correct, or request deletion of
              your personal information, subject to legal and academic record-keeping
              requirements. To exercise these rights, please contact the School
              Administrator.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              7. Children's Privacy
            </h2>
            <p>
              The Program is designed for adults and is not intended for
              individuals under the age of 18 (or the applicable age of
              majority). We do not knowingly collect personal information from
              children. If we become aware that we have inadvertently collected
              such information, we will take steps to delete it.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              8. Changes to This Privacy Policy
            </h2>
            <p>
              The School has the discretion to update this privacy policy at
              any time. When we do, we will revise the updated date at the top
              of this page. We encourage Students to frequently check this page
              for any changes to stay informed about how we are helping to
              protect the personal information we collect. You acknowledge and
              agree that it is your responsibility to review this privacy policy
              periodically and become aware of modifications.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              9. Your Acceptance of These Terms
            </h2>
            <p>
              By enrolling in the Program, you signify your acceptance of this
              policy. If you do not agree to this policy, please do not enroll
              or use our Program services. Your continued enrollment following
              the posting of changes to this policy will be deemed your
              acceptance of those changes.
            </p>

            <h2 className={`text-2xl font-bold ${deepBrown} font-serif mt-10 mb-4`}>
              10. Contacting Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, the
              practices of this School, or your dealings with the Program,
              please contact the School Administrator at:
              <br />
              <strong>Email:</strong> [email@email.com]
              <br />
              Or through the LMS messaging system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;