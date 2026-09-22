//About page
export default function About() {
  return (
    <main className="settings-page px-6 py-12">
      <section className="settings-container max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold">About This Project</h1>


        <p className="mt-6">
          This website is a Wordle and Word Search activity generator designed for
          Speech Pathology teachers. You can create phoneme based
           activities that should help students practise phoneme recognition,
           and decoding. Teachers can customise activities using 
          settings and export them as standalone HTML files that run
          independently.
        </p>

        <p className="mt-4">
          The application was created using <code>npx create-next-app</code> and
          focuses on frontend usability, responsive design, accessibility, and
          modular component structure. 
        </p>



        {/* Wordle */}
        <h2 className="mt-10 text-2xl font-semibold">Wordle Builder</h2>

        <p className="mt-3">
          The Wordle Builder generates a phoneme‑based guessing game. Teachers
          enter phoneme symbols to create a target word, and the game provides
          feedback indicating whether each phoneme is present, absent, or in the
          correct position. Difficulty is flexible and determined by the number of
          phonemes in the target word.
        </p>

        <p className="mt-3">
          The interface includes hover labels, phoneme hints, English‑equivalent
          feedback, and accessibility‑aware colour coding. Teachers can export a
          fully playable HTML version of the activity for classroom use.
        </p>



        {/* Word Search */}
        <h2 className="mt-8 text-2xl font-semibold">Word Search Builder</h2>

        <p className="mt-3">
          The Word Search Builder allows teachers to create custom phoneme‑based
          word searches. Words are placed within a 10×10 grid of phoneme symbols,
          and students locate them by dragging across the phonemes.
          Word length is flexible, allowing teachers to include short or long
          phoneme strings depending on the learning goal.
        </p>

        <p className="mt-3">
          The exported HTML version includes full gameplay logic, phoneme hints,
          colour coded selection feedback, and a win popup. It runs offline and
          requires no external dependencies.
        </p>



        {/* Interface Design */}
        <h2 className="mt-10 text-2xl font-semibold">Interface Design</h2>

        <p className="mt-3">
          The interface uses a modular component structure, ensuring each part of
          the application—Wordle grid, Word Search grid, settings panels,
          navigation, and accessibility controls—is implemented as an independent,
          reusable component. The layout is fully responsive across desktop,
          tablet, and mobile devices.
        </p>

        <p className="mt-3">
          Both activities use adaptive sizing to maintain readability on smaller
          screens. The navigation bar uses a hamburger menu for mobile devices, and
          all interactive elements are touch‑friendly.
        </p>



        {/* Accessibility */}
        <h2 className="mt-10 text-2xl font-semibold">Accessibility Features</h2>

        <p className="mt-3">
          Accessibility features include colour‑blind friendly palettes, dyslexia‑
          friendly font options, dark mode, hover labels, phoneme hints, and
          responsive touch controls. All global accessibility settings—except
          Wordle difficulty—are configured through the Settings page.
        </p>

        <p className="mt-3">
          Colour coding in both activities adapts automatically based on the
          selected accessibility mode, ensuring consistent feedback for all users.
        </p>

        {/* How it works */}
        <h2 className="mt-10 text-2xl font-semibold">How the Site Works</h2>

        <p className="mt-3">
          Teachers begin by selecting either the Wordle Builder or Word Search
          Builder. Global settings such as colour themes, dark mode, font
          preferences, and accessibility behaviour are configured through the
          Settings page. Wordle difficulty is controlled directly within the Wordle
          interface.
        </p>

        <p className="mt-3">
          Once an activity is configured, teachers can generate a standalone HTML
          file. The exported file contains all necessary styling and logic,
          allowing it to run independently without additional software.
        </p>

        {/* References */}
        <h2 className="mt-10 text-2xl font-semibold">Reference List</h2>

        <ul className="mt-4 list-disc ml-6 space-y-3">
          <li>
            Vocabulary.com. (2024). <i>IPA pronunciation guide.</i>{" "}
            <a
              href="https://www.vocabulary.com/resources/ipa-pronunciation/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              https://www.vocabulary.com/resources/ipa-pronunciation/
            </a>
          </li>

          <li>
            International Phonetic Association. (2003). <i>IPA chart.</i>{" "}
            <a
              href="https://www.ipachart.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              https://www.ipachart.com/
            </a>
          </li>

          <li>
            International Phonetic Alphabet. (2020). <i>IPA chart with sounds.</i>{" "}
            <a
              href="https://www.internationalphoneticalphabet.org/ipa-sounds/ipa-chart-with-sounds/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              https://www.internationalphoneticalphabet.org/ipa-sounds/ipa-chart-with-sounds/
            </a>
          </li>

          <li>
            React. (2022). <i>Creating a React app.</i>{" "}
            <a
              href="https://react.dev/learn/creating-a-react-app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              https://react.dev/learn/creating-a-react-app
            </a>
          </li>

          <li>
            Chaudhary, R. (2022). <i>How to create Next.js app.</i> Webkul Blog.{" "}
            <a
              href="https://webkul.com/blog/how-to-create-next-app/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              https://webkul.com/blog/how-to-create-next-app/
            </a>
          </li>

          <li>
            Davis, A. (2024). <i>Build a Wordle clone in React.</i> YouTube.{" "}
            <a
              href="https://www.youtube.com/watch?v=3r4FGUWMqTM"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              https://www.youtube.com/watch?v=3r4FGUWMqTM
            </a>
          </li>

          <li>
            Faxraddin, A. (2024). <i>Pixel cursor trailing effect with Next.js.</i>{" "}
            <a
              href="https://medium.com/@arthuryuzbashev/pixel-cursor-trailing-effect-with-next-js-and-react-js-b9e7ba891c3d"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              https://medium.com/@arthuryuzbashev/pixel-cursor-trailing-effect-with-next-js-and-react-js-b9e7ba891c3d
            </a>
          </li>
        </ul>

        {/* Video */}
        <h2 className="mt-10 text-2xl font-semibold">Video</h2>

        <p className="mt-3">
          <a
            href=""
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600"
          >
            Assess 1 Zoom Recording Link
          </a>
          <br />
          <strong>Passcode:</strong> ---
        </p>

      </section>
    </main>
  );
}
