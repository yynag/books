# Part II. Design

[[toc]]

## 4. Modularity: Keeping It Clean, Keeping It Simple

There are two ways of constructing a software design. One is to make it so simple that there are obviously no deficiencies; the other is to make it so complicated that there are no obvious deficiencies. The first method is far more difficult.

The Emperor’s Old Clothes, CACM February 1981
—C. A. R. Hoare

There is a natural hierarchy of code-partitioning methods that has evolved as programmers have had to manage ever-increasing levels of complexity. In the beginning, everything was one big lump of machine code. The earliest procedural languages brought in the notion of partition by subroutine. Then we invented service libraries to share common utility functions among multiple programs. Next, we invented separated address spaces and communicating processes. Today we routinely distribute program systems across multiple hosts separated by thousands of miles of network cable.

The early developers of Unix were among the pioneers in software modularity. Before them, the Rule of Modularity was computer-science theory but not engineering practice. In Design Rules [Baldwin-Clark], a path-breaking study of the economics of modularity in engineering design, the authors use the development of the computer industry as a case study and argue that the Unix community was in fact the first to systematically apply modular decomposition to production software, as opposed to hardware. Modularity of hardware has of course been one of the foundations of engineering since the adoption of standard screw threads in the late 1800s.

The Rule of Modularity bears amplification here: The only way to write complex software that won’t fall on its face is to build it out of simple modules connected by well-defined interfaces, so that most problems are local and you can have some hope of fixing or optimizing a part without breaking the whole.

The tradition of being careful about modularity and of paying close attention to issues like orthogonality and compactness are still much deeper in the bone among Unix programmers than elsewhere.

Early Unix programmers became good at modularity because they had to be. An OS is one of the most complicated pieces of code around. If it is not well structured, it will fall apart. There were a couple of early failures at building Unix that were scrapped. One can blame the early (structureless) C for this, but basically it was because the OS was too complicated to write. We needed both refinements in tools (like C structures) and good practice in using them (like Rob Pike’s rules for programming) before we could tame that complexity.

—Ken Thompson

Early Unix hackers struggled with this in many ways. In the languages of 1970 function calls were expensive, either because call semantics were complicated (PL/1. Algol) or because the compiler was optimizing for other things like fast inner loops at the expense of call time. Thus, code tended to be written in big lumps. Ken and several of the other early Unix developers knew modularity was a good idea, but they remembered PL/1 and were reluctant to write small functions lest performance go to hell.

Dennis Ritchie encouraged modularity by telling all and sundry that function calls were really, really cheap in C. Everybody started writing small functions and modularizing. Years later we found out that function calls were still expensive on the PDP-11, and VAX code was often spending 50% of its time in the CALLS instruction. Dennis had lied to us! But it was too late; we were all hooked...

—Steve Johnson

All programmers today, Unix natives or not, are taught to modularize at the subroutine level within programs. Some learn the art of doing this at the module or abstract-data-type level and call that ’good design’. The design-patterns movement is making a noble effort to push up a level from there and discover successful design abstractions that can be applied to organize the large-scale structure of programs.

Getting better at all these kinds of problem partitioning is a worthy goal, and many excellent treatments of them are available elsewhere. We shall not attempt to cover all the issues relating to modularity within programs in too much detail: first, because that is a subject for an entire volume (or several volumes) in itself; and second, because this is a book about the art of Unix programming.

What we will do here is examine more specifically what the Unix tradition teaches us about how to follow the Rule of Modularity. In this chapter, our examples will live within process units. Later, in Chapter 7, we’ll examine the circumstances under which partitioning programs into multiple cooperating processes is a good idea, and discuss more specific techniques for doing that partitioning.


### 4.1 Encapsulation and Optimal Module Size
The first and most important quality of modular code is encapsulation. Well-encapsulated modules don’t expose their internals to each other. They don’t call into the middle of each others’ implementations, and they don’t promiscuously share global data. They communicate using application programming interfaces (APIs)—narrow, well-defined sets of procedure calls and data structures. This is what the Rule of Modularity is about.

The APIs between modules have a dual role. On the implementation level, they function as choke points between the modules, preventing the internals of each from leaking into its neighbors. On the design level, it is the APIs (not the bits of implementation between them) that really define your architecture.

One good test for whether an API is well designed is this one: if you try to write a description of it in purely human language (with no source-code extracts allowed), does it make sense? It is a very good idea to get into the habit of writing informal descriptions of your APIs before you code them. Indeed, some of the most able developers start by defining their interfaces, writing brief comments to describe them, and then writing the code—since the process of writing the comment clarifies what the code must do. Such descriptions help you organize your thoughts, they make useful module comments, and eventually you might want to turn them into a roadmap document for future readers of the code.

As you push module decomposition harder, the pieces get smaller and the definition of the APIs gets more important. Global complexity, and consequent vulnerability to bugs, decreases. It has been received wisdom in computer science since the 1970s (exemplified in papers such as [Parnas]) that you ought to design your software systems as hierarchies of nested modules, with the grain size of the modules at each level held to a minimum.

It is possible, however, to push this kind of decomposition too hard and make your modules too small. There is evidence [Hatton97] that when one plots defect density versus module size, the curve is U-shaped and concave upwards (see Figure 4.1). Very small and very large modules are associated with more bugs than those of intermediate size. A different way of viewing the same data is to plot lines of code per module versus total bugs. The curve looks roughly logarithmic up to a ’sweet spot’ where it flattens (corresponding to the minimum in the defect density curve), after which it goes up as the square of the number of the lines of code (which is what one might intuitively expect for the whole curve, following Brooks’s Law1).

1 Brooks’s Law predicts that adding programmers to a late project makes it later. More generally, it predicts that costs and error rates rise as the square of the number of programmers on a project.


Figure 4.1. Qualitative plot of defect count and density vs. module size.

image

This unexpectedly increasing incidence of bugs at small module sizes holds across a wide variety of systems implemented in different languages. Hatton has proposed a model relating this nonlinearity to the chunk size of human short-term memory.2 Another way to interpret the nonlinearity is that at small module grain sizes, the increasing complexity of the interfaces becomes the dominating term; it’s difficult to read the code because you have to understand everything before you can understand anything. In Chapter 7 we’ll examine more advanced forms of program partitioning; there, too, the complexity of interface protocols comes to dominate the total complexity of the system as the component processes get smaller.

2 In Hatton’s model, small differences in the maximum chunk size a programmer can hold in short-term memory have a large multiplicative effect on the programmer’s efficiency. This might be a major contributor to the order-of-magnitude (or larger) variations in effectiveness observed by Fred Brooks and others.

In nonmathematical terms, Hatton’s empirical results imply a sweet spot between 200 and 400 logical lines of code that minimizes probable defect density, all other factors (such as programmer skill) being equal. This size is independent of the language being used—an observation which strongly reinforces the advice given elsewhere in this book to program with the most powerful languages and tools you can. Beware of taking these numbers too literally however. Methods for counting lines of code vary considerably according to what the analyst considers a logical line, and other biases (such as whether comments are stripped). Hatton himself suggests as a rule of thumb a 2x conversion between logical and physical lines, suggesting an optimal range of 400–800 physical lines.


### 4.2 Compactness and Orthogonality
Code is not the only sort of thing with an optimal chunk size. Languages and APIs (such as sets of library or system calls) run up against the same sorts of human cognitive constraints that produce Hatton’s U-curve.

Accordingly, Unix programmers have learned to think very hard about two other properties when designing APIs, command sets, protocols, and other ways to make computers do tricks: compactness and orthogonality.


#### 4.2.1 Compactness
Compactness is the property that a design can fit inside a human being’s head. A good practical test for compactness is this: Does an experienced user normally need a manual? If not, then the design (or at least the subset of it that covers normal use) is compact.

Compact software tools have all the virtues of physical tools that fit well in the hand. They feel pleasant to use, they don’t obtrude themselves between your mind and your work, they make you more productive—and they are much less likely than unwieldy tools to turn in your hand and injure you.

Compact is not equivalent to ’weak’. A design can have a great deal of power and flexibility and still be compact if it is built on abstractions that are easy to think about and fit together well. Nor is compact equivalent to ’easily learned’; some compact designs are quite difficult to understand until you have mastered an underlying conceptual model that is tricky, at which point your view of the world changes and compact becomes simple. For a lot of people, the Lisp language is a classic example of this.

Nor does compact mean ’small’. If a well-designed system is predictable and ’obvious’ to the experienced user, it might have quite a few pieces.

—Ken Arnold

Very few software designs are compact in an absolute sense, but many are compact in a slightly looser sense of the term. They have a compact working set, a subset of capabilities that suffices for 80% or more of what expert users normally do with them. Practically speaking, such designs normally need a reference card or cheat sheet but not a manual. We’ll call such designs semi-compact, as opposed to strictly compact.

The concept is perhaps best illustrated by examples. The Unix system call API is semi-compact, but the standard C library is not compact in any sense. While Unix programmers easily keep a subset of the system calls sufficient for most applications programming (file system operations, signals, and process control) in their heads, the C library on modern Unixes includes many hundreds of entry points, e.g., mathematical functions, that won’t all fit inside a single programmer’s cranium.

The Magical Number Seven, Plus or Minus Two: Some Limits on Our Capacity for Processing Information [Miller] is one of the foundation papers in cognitive psychology (and, incidentally, the specific reason that U.S. local telephone numbers have seven digits). It showed that the number of discrete items of information human beings can hold in short-term memory is seven, plus or minus two. This gives us a good rule of thumb for evaluating the compactness of APIs: Does a programmer have to remember more than seven entry points? Anything larger than this is unlikely to be strictly compact.

Among Unix tools, make(1) is compact; autoconf(1) and automake(1) are not. Among markup languages, HTML is semi-compact, but DocBook (a documentation markup language we shall discuss in Chapter 18) is not. The man(7) macros are compact, but troff(1) markup is not.

Among general-purpose programming languages, C and Python are semi-compact; Perl, Java, Emacs Lisp, and shell are not (especially since serious shell programming requires you to know half-a-dozen other tools like sed(1) and awk(1)). C++ is anti-compact—the language’s designer has admitted that he doesn’t expect any one programmer to ever understand it all.

Some designs that are not compact have enough internal redundancy of features that individual programmers end up carving out compact dialects sufficient for that 80% of common tasks by choosing a working subset of the language. Perl has this kind of pseudo-compactness, for example. Such designs have a built-in trap; when two programmers try to communicate about a project, they may find that differences in their working subsets are a significant barrier to understanding and modifying the code.

Noncompact designs are not automatically doomed or bad, however. Some problem domains are simply too complex for a compact design to span them. Sometimes it’s necessary to trade away compactness for some other virtue, like raw power and range. Troff markup is a good example of this. So is the BSD sockets API. The purpose of emphasizing compactness as a virtue is not to condition you to treat compactness as an absolute requirement, but to teach you to do what Unix programmers do: value compactness properly, design for it whenever possible, and not throw it away casually.


#### 4.2.2 Orthogonality
Orthogonality is one of the most important properties that can help make even complex designs compact. In a purely orthogonal design, operations do not have side effects; each action (whether it’s an API call, a macro invocation, or a language operation) changes just one thing without affecting others. There is one and only one way to change each property of whatever system you are controlling.

Your monitor has orthogonal controls. You can change the brightness independently of the contrast level, and (if the monitor has one) the color balance control will be independent of both. Imagine how much more difficult it would be to adjust a monitor on which the brightness knob affected the color balance: you’d have to compensate by tweaking the color balance every time after you changed the brightness. Worse, imagine if the contrast control also affected the color balance; then, you’d have to adjust both knobs simultaneously in exactly the right way to change either contrast or color balance alone while holding the other constant.

Far too many software designs are non-orthogonal. One common class of design mistake, for example, occurs in code that reads and parses data from one (source) format to another (target) format. A designer who thinks of the source format as always being stored in a disk file may write the conversion function to open and read from a named file. Usually the input could just as well have been any file handle. If the conversion routine were designed orthogonally, e.g., without the side effect of opening a file, it could save work later when the conversion has to be done on a data stream supplied from standard input, a network socket, or any other source.

Doug McIlroy’s advice to “Do one thing well” is usually interpreted as being about simplicity. But it’s also, implicitly and at least as importantly, about orthogonality.

It’s not a problem for a program to do one thing well and other things as side effects, provided supporting those other things doesn’t raise the complexity of the program and its vulnerability to bugs. In Chapter 9 we’ll examine a program called ascii that prints synonyms for the names of ASCII characters, including hex, octal, and binary values; as a side effect, it can serve as a quick base converter for numbers in the range 0–255. This second use is not an orthogonality violation because the features that support it are all necessary to the primary function; they do not make the program more difficult to document or maintain.

The problems with non-orthogonality arise when side effects complicate a programmer’s or user’s mental model, and beg to be forgotten, with results ranging from inconvenient to dire. Even when you do not forget the side effects, you’re often forced to do extra work to suppress them or work around them.

There is an excellent discussion of orthogonality and how to achieve it in The Pragmatic Programmer [Hunt-Thomas]. As they point out, orthogonality reduces test and development time, because it’s easier to verify code that neither causes side effects nor depends on side effects from other code—there are fewer combinations to test. If it breaks, orthogonal code is more easily replaced without disturbance to the rest of the system. Finally, orthogonal code is easier to document and reuse.

The concept of refactoring, which first emerged as an explicit idea from the ’Extreme Programming’ school, is closely related to orthogonality. To refactor code is to change its structure and organization without changing its observable behavior. Software engineers have been doing this since the birth of the field, of course, but naming the practice and identifying a stock set of refactoring techniques has helped concentrate peoples’ thinking in useful ways. Because these fit so well with the central concerns of the Unix design tradition, Unix developers have quickly coopted the terminology and ideas of refactoring.3

3 In the foundation text on this topic, Refactoring [Fowler], the author comes very close to stating that the principal goal of refactoring is to improve orthogonality. But lacking the concept, he can only approximate this idea from several different directions: eliminating code duplication and various other “bad smells” many of which are some sort of orthogonality violation.

The basic Unix APIs were designed for orthogonality with imperfect but considerable success. We take for granted being able to open a file for write access without exclusive-locking it for write, for example; not all operating systems are so graceful. Old-style (System III) signals were non-orthogonal, because signal receipt had the side-effect of resetting the signal handler to the default die-on-receipt. There are large non-orthogonal patches like the BSD sockets API and very large ones like the X windowing system’s drawing libraries.

But on the whole the Unix API is a good example: Otherwise it not only would not but could not be so widely imitated by C libraries on other operating systems. This is also a reason that the Unix API repays study even if you are not a Unix programmer; it has lessons about orthogonality to teach.


#### 4.2.3 The SPOT Rule
The Pragmatic Programmer articulates a rule for one particular kind of orthogonality that is especially important. Their “Don’t Repeat Yourself” rule is: every piece of knowledge must have a single, unambiguous, authoritative representation within a system. In this book we prefer, following a suggestion by Brian Kernighan, to call this the Single Point Of Truth or SPOT rule.

Repetition leads to inconsistency and code that is subtly broken, because you changed only some repetitions when you needed to change all of them. Often, it also means that you haven’t properly thought through the organization of your code.

Constants, tables, and metadata should be declared and initialized once and imported elsewhere. Any time you see duplicate code, that’s a danger sign. Complexity is a cost; don’t pay it twice.

Often it’s possible to remove code duplication by refactoring; that is, changing the organization of your code without changing the core algorithms. Data duplication sometimes appears to be forced on you. But when you see it, here are some valuable questions to ask:

• If you have duplicated data in your code because it has to have two different representations in two different places, can you write a function, tool or code generator to make one representation from the other, or both from a common source?

• If your documentation duplicates knowledge in your code, can you generate parts of the documentation from parts of the code, or vice-versa, or both from a common higher-level representation?

• If your header files and interface declarations duplicate knowledge in your implementation code, is there a way you can generate the header files and interface declarations from the code?

There is an analog of the SPOT rule for data structures: “No junk, no confusion”. “No junk” says that the data structure (the model) should be minimal, e.g., not made so general that it can represent situations which cannot exist. “No confusion” says that states which must be kept distinct in the real-world problem must be kept distinct in the model. In short, the SPOT rule advocates seeking a data structure whose states have a one-to-one correspondence with the states of the real-world system to be modeled.

From deeper within the Unix tradition, we can add some of our own corollaries of the SPOT rule:

• Are you duplicating data because you’re caching intermediate results of some computation or lookup? Consider carefully whether this is premature optimization; stale caches (and the layers of code needed to keep caches synchronized) are a fertile source of bugs,4 and can even slow down overall performance if (as often happens) the cache-management overhead is higher than you expected.

4 An archetypal example of bad caching is the rehash directive in csh(1); type man 1 csh for details. See Section 12.4.3 for another example.

• If you see lots of duplicative boilerplate code, can you generate all of it from a single higher-level representation, twiddling a few knobs to generate the different cases?

The reader should begin to see a pattern emerging here.

In the Unix world, the SPOT Rule as a unifying idea has seldom been explicit—but heavy use of code generators to implement particular kinds of SPOT are very much part of the tradition. We’ll survey these techniques in Chapter 9.


#### 4.2.4 Compactness and the Strong Single Center
One subtle but powerful way to promote compactness in a design is to organize it around a strong core algorithm addressing a clear formal definition of the problem, avoiding heuristics and fudging.

Formalization often clarifies a task spectacularly. It is not enough for a programmer to recognize that bits of his task fall within standard computer-science categories—a little depth-first search here and a quicksort there. The best results occur when the nub of the task can be formalized, and a clear model of the job at hand can be constructed. It is not necessary that ultimate users comprehend the model. The very existence of a unifying core will provide a comfortable feel, unencumbered with the why-in-hell-did-they-do-that moments that are so prevalent in using Swiss-army-knife programs.

—Doug McIlroy

This is an often-overlooked strength of the Unix tradition. Many of its most effective tools are thin wrappers around a direct translation of some single powerful algorithm.

Perhaps the clearest example of this is diff(1), the Unix tool for reporting differences between related files. This tool and its dual, patch(1), have become central to the network-distributed development style of modern Unix. A valuable property of diff is that it seldom surprises anyone. It doesn’t have special cases or painful edge conditions, because it uses a simple, mathematically sound method of sequence comparison. This has consequences:

By virtue of a mathematical model and a solid algorithm, Unix diff contrasts markedly with its imitators. First, the central engine is solid, small, and has never needed one line of maintenance. Second, the results are clear and consistent, unmarred by surprises where heuristics fail.

—Doug McIlroy

Thus, people who use diff can develop an intuitive feel for what it will do in any given situation without necessarily understanding the central algorithm perfectly. Other well-known examples of this special kind of clarity achieved through a strong central algorithm abound in Unix:

• The grep(1) utility for selecting lines out of files by pattern matching is a simple wrapper around a formal algebra of regular-expression patterns (see Section 8.2.2 for discussion). If it had lacked this consistent mathematical model, it would probably look like the design of the original glob(1) facility in the oldest Unixes, a handful of ad-hoc wildcards that can’t be combined.

• The yacc(1) utility for generating language parsers is a thin wrapper around the formal theory of LR(1) grammars. Its partner, the lexical analyzer generator lex(1), is a similarly thin wrapper around the theory of nondeterministic finite-state automata.

All three of these programs are so bug-free that their correct functioning is taken utterly for granted, and compact enough to fit easily in a programmer’s hand. Only a part of these good qualities are due to the polishing that comes with a long service life and frequent use; most of it is that, having been constructed around a strong and provably correct algorithmic core, they never needed much polishing in the first place.

The opposite of a formal approach is using heuristics—rules of thumb leading toward a solution that is probabilistically, but not certainly, correct. Sometimes we use heuristics because a deterministically correct solution is impossible. Think of spam filtering, for example; an algorithmically perfect spam filter would need a full solution to the problem of understanding natural language as a module. Other times, we use heuristics because known formally correct methods are impossibly expensive. Virtual-memory management is an example of this; there are near-perfect solutions, but they require so much runtime instrumentation that their overhead would swamp any theoretical gain over heuristics.

The trouble with heuristics is that they proliferate special cases and edge cases. If nothing else, you usually have to backstop a heuristic with some sort of recovery mechanism when it fails. All the usual problems with escalating complexity follow. To manage the resulting tradeoffs, you have to start by being aware of them. Always ask if a heuristic actually pays off in performance what it costs in code complexity—and don’t guess at the performance difference, actually measure it before making a decision.


#### 4.2.5 The Value of Detachment
We began this book with a reference to Zen: “a special transmission, outside the scriptures”. This was not mere exoticism for stylistic effect; the core concepts of Unix have always had a spare, Zen-like simplicity that continues to shine through the layers of historical accidents that have accreted around them. This quality is reflected in the cornerstone documents of Unix, like The C Programming Language [Kernighan-Ritchie] and the 1974 CACM paper that introduced Unix to the world; one of the famous quotes from that paper observes “...constraint has encouraged not only economy, but also a certain elegance of design”. That simplicity came from trying to think not about how much a language or operating system could do, but of how little it could do—not by carrying assumptions but by starting from zero (what in Zen is called “beginner’s mind” or “empty mind”).

To design for compactness and orthogonality, start from zero. Zen teaches that attachment leads to suffering; experience with software design teaches that attachment to unnoticed assumptions leads to non-orthogonality, noncompact designs, and projects that fail or become maintenance nightmares.

To achieve enlightenment and surcease from suffering, Zen teaches detachment. The Unix tradition teaches the value of detachment from the particular, accidental conditions under which a design problem was posed. Abstract. Simplify. Generalize. Because we write software to solve problems, we cannot completely detach from the problems—but it is well worth the mental effort to see how many preconceptions you can throw away, and whether the design becomes more compact and orthogonal as you do that. Possibilities for code reuse often result.

Jokes about the relationship between Unix and Zen are a live part of the Unix tradition as well.5 This is not an accident.

5 For a recent example of Unix/Zen crossover, see Appendix D.


### 4.3 Software Is a Many-Layered Thing
Broadly speaking, there are two directions one can go in designing a hierarchy of functions or objects. Which direction you choose, and when, has a profound effect on the layering of your code.


#### 4.3.1 Top-Down versus Bottom-Up
One direction is bottom-up, from concrete to abstract—working up from the specific operations in the problem domain that you know you will need to perform. For example, if one is designing firmware for a disk drive, some of the bottom-level primitives might be ’seek head to physical block’, ’read physical block’, ’write physical block’, ’toggle drive LED’, etc.

The other direction is top-down, abstract to concrete—from the highest-level specification describing the project as a whole, or the application logic, downwards to individual operations. Thus, if one is designing software for a mass-storage controller that might drive several different sorts of media, one might start with abstract operations like ’seek logical block’, ’read logical block’, ’write logical block’, ’toggle activity indication’. These would differ from the similarly named hardware-level operations above in that they’re intended to be generic across different kinds of physical devices.

These two examples could be two ways of approaching design for the same collection of hardware. Your choice, in cases like this, is one of these: either abstract the hardware (so the objects encapsulate the real things out there and the program is merely a list of manipulations on those things), or organize around some behavioral model (and then embed the actual hardware manipulations that carry it out in the flow of the behavioral logic).

An analogous choice shows up in a lot of different contexts. Suppose you’re writing MIDI sequencer software. You could organize that code around its top level (sequencing tracks) or around its bottom level (switching patches or samples and driving wave generators).

A very concrete way to think about this difference is to ask whether the design is organized around its main event loop (which tends to have the high-level application logic close to it) or around a service library of all the operations that the main loop can invoke. A designer working from the top down will start by thinking about the program’s main event loop, and plug in specific events later. A designer working from the bottom up will start by thinking about encapsulating specific tasks and glue them together into some kind of coherent order later on.

For a larger example, consider the design of a Web browser. The top-level design of a Web browser is a specification of the expected behavior of the browser: what types of URL (like http: or ftp: or file:) it interprets, what kinds of images it is expected to be able to render, whether and with what limitations it will accept Java or JavaScript, etc. The layer of the implementation that corresponds to this top-level view is its main event loop; each time around, the loop waits for, collects, and dispatches on a user action (such as clicking a Web link or typing a character into a field).

But the Web browser has to call a large set of domain primitives to do its job. One group of these is concerned with establishing network connections, sending data over them, and receiving responses. Another set is the operations of the GUI toolkit the browser will use. Yet a third set might be concerned with the mechanics of parsing retrieved HTML from text into a document object tree.

Which end of the stack you start with matters a lot, because the layer at the other end is quite likely to be constrained by your initial choices. In particular, if you program purely from the top down, you may find yourself in the uncomfortable position that the domain primitives your application logic wants don’t match the ones you can actually implement. On the other hand, if you program purely from the bottom up, you may find yourself doing a lot of work that is irrelevant to the application logic—or merely designing a pile of bricks when you were trying to build a house.

Ever since the structured-programming controversies of the 1960s, novice programmers have generally been taught that the correct approach is the top-down one: stepwise refinement, where you specify what your program is to do at an abstract level and gradually fill in the blanks of implementation until you have concrete working code. Top-down tends to be good practice when three preconditions are true: (a) you can specify in advance precisely what the program is to do, (b) the specification is unlikely to change significantly during implementation, and (c) you have a lot of freedom in choosing, at a low level, how the program is to get that job done.

These conditions tend to be fulfilled most often in programs relatively close to the user and high in the software stack—applications programming. But even there those preconditions often fail. You can’t count on knowing what the ’right’ way for a word processor or a drawing program to behave is until the user interface has had end-user testing. Purely top-down programming often has the effect of overinvesting effort in code that has to be scrapped and rebuilt because the interface doesn’t pass a reality check.

In self-defense against this, programmers try to do both things—express the abstract specification as top-down application logic, and capture a lot of low-level domain primitives in functions or libraries, so they can be reused when the high-level design changes.

Unix programmers inherit a tradition that is centered in systems programming, where the low-level primitives are hardware-level operations that are fixed in character and extremely important. They therefore lean, by learned instinct, more toward bottom-up programming.

Whether you’re a systems programmer or not, bottom-up can also look more attractive when you are programming in an exploratory way, trying to get a grasp on hardware or software or real-world phenomena you don’t yet completely understand. Bottom-up programming gives you time and room to refine a vague specification. Bottom-up also appeals to programmers’ natural human laziness—when you have to scrap and rebuild code, you tend to have to throw away larger pieces if you’re working top-down than you do if you’re working bottom-up.

Real code, therefore tends to be programmed both top-down and bottom-up. Often, top-down and bottom-up code will be part of the same project. That’s where ’glue’ enters the picture.


#### 4.3.2 Glue Layers
When the top-down and bottom-up drives collide, the result is often a mess. The top layer of application logic and the bottom layer of domain primitives have to be impedance-matched by a layer of glue logic.

One of the lessons Unix programmers have learned over decades is that glue is nasty stuff and that it is vitally important to keep glue layers as thin as possible. Glue should stick things together, but should not be used to hide cracks and unevenness in the layers.

In the Web-browser example, the glue would include the rendering code that maps a document object parsed from incoming HTML into a flattened visual representation as a bitmap in a display buffer, using GUI domain primitives to do the painting. This rendering code is notoriously the most bug-prone part of a browser. It attracts into itself kluges to address problems that originate both in the HTML parsing (because there is a lot of ill-formed markup out there) and the GUI toolkit (which may not have quite the primitives that are really needed).

A Web browser’s glue layer has to mediate not merely between specification and domain primitives, but between several different external specifications: the network behavior standardized in HTTP, HTML document structure, and various graphics and multimedia formats as well as the users’ behavioral expectations from the GUI.

And one single bug-prone glue layer is not the worst fate that can befall a design. A designer who is aware that the glue layer exists, and tries to organize it into a middle layer around its own set of data structures or objects, can end up with two layers of glue—one above the midlayer and one below. Programmers who are bright but unseasoned are particularly apt to fall into this trap; they’ll get each fundamental set of classes (application logic, midlayer, and domain primitives) right and make them look like the textbook examples, only to flounder as the multiple layers of glue needed to integrate all that pretty code get thicker and thicker.

The thin-glue principle can be viewed as a refinement of the Rule of Separation. Policy (the application logic) should be cleanly separated from mechanism (the domain primitives), but if there is a lot of code that is neither policy nor mechanism, chances are that it is accomplishing very little besides adding global complexity to the system.


#### 4.3.3 Case Study: C Considered as Thin Glue
The C language itself is a good example of the effectiveness of thin glue.

In the late 1990s, Gerrit Blaauw and Fred Brooks observed in Computer Architecture: Concepts and Evolution [BlaauwBrooks] that the architectures in every generation of computers, from early mainframes through minicomputers through workstations through PCs, had tended to converge. The later a design was in its technology generation, the more closely it approximated what Blaauw & Brooks called the “classical architecture”: binary representation, flat address space, a distinction between memory and working store (registers), general-purpose registers, address resolution to fixed-length bytes, two-address instructions, big-endianness,6 and data types a consistent set with sizes a multiple of either 4 or 6 bits (the 6-bit families are now extinct).

6 The terms big-endian and little-endian refer to architectural choices about the order in which bits are interpreted within a machine word. Though it has no canonical location, a Web search for On Holy Wars and a Plea for Peace should turn up a classic and entertaining paper on this subject.

Thompson and Ritchie designed C to be a sort of structured assembler for an idealized processor and memory architecture that they expected could be efficiently modeled on most conventional computers. By happy accident, their model for the idealized processor was the PDP-11, a particularly mature and elegant minicomputer design that closely approximated Blaauw & Brooks’s classical architecture. By good judgment, Thompson and Ritchie declined to wire into their language most of the few traits (such as little-endian byte order) where the PDP-11 didn’t match it.7

7 The widespread belief that the autoincrement and autodecrement features entered C because they represented PDP-11 machine instructions is a myth. According to Dennis Ritchie, these operations were present in the ancestral B language before the PDP-11 existed.

The PDP-11 became an important model for the following generations of microprocessor architectures. The basic abstractions of C turned out to capture the classical architecture rather neatly. Thus, C started out as a good fit for microprocessors and, rather than becoming irrelevant as its assumptions fell out of date, actually became a better fit as hardware converged more closely on the classical architecture. One notable example of this convergence was when Intel’s 386, with its large flat memory-address space, replaced the 286’s awkward segmented-memory addressing after 1985; pure C was actually a better fit for the 386 than it had been for the 286.

It is not a coincidence that the experimental era in computer architectures ended in the mid-1980s at the same time that C (and its close descendant C++) were sweeping all before them as general-purpose programming languages. C, designed as a thin but flexible layer over the classical architecture, looks with two decades’ additional perspective like almost the best possible design for the structured-assembler niche it was intended to fill. In addition to compactness, orthogonality, and detachment (from the machine architecture on which it was originally designed), it also has the important quality of transparency that we will discuss in Chapter 6. The few language designs since that are arguably better have needed to make large changes (like introducing garbage collection) in order to get enough functional distance from C not to be swamped by it.

This history is worth recalling and understanding because C shows us how powerful a clean, minimalist design can be. If Thompson and Ritchie had been less wise, they would have designed a language that did much more, relied on stronger assumptions, never ported satisfactorily off its original hardware platform, and withered away as the world changed out from under it. Instead, C has flourished—and the example Thompson and Ritchie set has influenced the style of Unix development ever since. As the writer, adventurer, artist, and aeronautical engineer Antoine de Saint-Exupéry once put it, writing about the design of airplanes: “La perfection est atteinte non quand il ne reste rien à ajouter, mais quand il ne reste rien à enlever”. (“Perfection is attained not when there is nothing more to add, but when there is nothing more to remove”.)

Ritchie and Thompson lived by this maxim. Long after the resource constraints on early Unix software had eased, they worked at keeping C as thin a layer over the hardware as possible.

Dennis used to say to me, when I would ask for some particularly extravagant feature in C, “If you want PL/1, you know where to get it”. He didn’t have to deal with some marketer saying “But we need a check in the box on the sales viewgraph!”

—Mike Lesk

The history of C is also a lesson in the value of having a working reference implementation before you standardize. We’ll return to this point in Chapter 17 when we discuss the evolution of C and Unix standards.


### 4.4 Libraries
One consequence of the emphasis that the Unix programming style put on modularity and well-defined APIs is a strong tendency to factor programs into bits of glue connecting collections of libraries, especially shared libraries (the equivalents of what are called dynamically-linked libraries or DLLs under Windows and other operating systems).

If you are careful and clever about design, it is often possible to partition a program so that it consists of a user-interface-handling main section (policy) and a collection of service routines (mechanism) with effectively no glue at all. This approach is especially appropriate when the program has to do a lot of very specific manipulations of data structures like graphic images, network-protocol packets, or control blocks for a hardware interface. Some good general architectural advice from within the Unix tradition, particularly applicable to the resource-management challenges of this sort of library is collected in The Discipline and Method Architecture for Reusable Libraries [Vo].

Under Unix, it is normal practice to make this layering explicit, with the service routines collected in a library that is separately documented. In such programs, the front end gets to specialize in user-interface considerations and high-level protocol. With a little more care in design, it may be possible to detach the original front end and replace it with others adapted for different purposes. Some other advantages should become evident from our case study.

There is a flip side to this. In the Unix world, libraries which are delivered as libraries should come with exerciser programs.

APIs should come with programs, and vice versa. An API that you must write C code to use, which cannot be invoked easily from the command line, is harder to learn and use. And contrariwise, it’s a royal pain to have interfaces whose only open, documented form is a program, so you cannot invoke them easily from a C program—for example, route(1) in older Linuxes.

—Henry Spencer

Besides easing the learning curve, library exercisers often make excellent test frameworks. Experienced Unix programmers therefore see them not just as a form of thoughtfulness to the library’s users but as an indication that the code has probably been well tested.

An important form of library layering is the plugin, a library with a set of known entry points that is dynamically loaded after startup time to perform a specialized task. For plugins to work, the calling program has to be organized largely as a documented service library that the plugin can call back into.


#### 4.4.1 Case Study: GIMP Plugins
The GIMP (GNU Image Manipulation program) is a graphics editor designed to be driven through an interactive GUI. But GIMP is built as a library of image-manipulation and housekeeping routines called by a relatively thin layer of control code. The driver code knows about the GUI, but not directly about image formats; the library routines reverse this by knowing about image formats and operations but not about the GUI.

The library layer is documented (and, in fact shipped as “libgimp” for use by other programs). This means that C programs called “plugins” can be dynamically loaded by GIMP and call the library to do image manipulation, effectively taking over control at the same level as the GUI (see Figure 4.2).


Figure 4.2. Caller/callee relationships in GIMP with a plugin loaded.

image

Plugins are used to perform lots of special-purpose transformations such as colormap hacking, blurring and despeckling; also for reading and writing file formats not native to the GIMP core; for extensions like editing animations and window manager themes; and for lots of other sorts of image-hacking that can be automated by scripting the image-hacking logic in the GIMP core. A registry of GIMP plugins is available on the World Wide Web.

Though most GIMP plugins are small, simple C programs, it is also possible to write a plugin that exposes the library API to a scripting language; we’ll discuss this possibility in Chapter 11 when we examine the ’polyvalent program’ pattern.


### 4.5 Unix and Object-Oriented Languages
Since the mid-1980s most new language designs have included native support for object-oriented programming (OO). Recall that in object-oriented programming, the functions that act on a particular data structure are encapsulated with the data in an object that can be treated as a unit. By contrast, modules in non-OO languages make the association between data and the functions that act on it rather accidental, and modules frequently leak data or bits of their internals into each other.

The OO design concept initially proved valuable in the design of graphics systems, graphical user interfaces, and certain kinds of simulation. To the surprise and gradual disillusionment of many, it has proven difficult to demonstrate significant benefits of OO outside those areas. It’s worth trying to understand why.

There is some tension and conflict between the Unix tradition of modularity and the usage patterns that have developed around OO languages. Unix programmers have always tended to be a bit more skeptical about OO than their counterparts elsewhere. Part of this is because of the Rule of Diversity; OO has far too often been promoted as the One True Solution to the software-complexity problem. But there is something else behind it as well, an issue which is worth exploring as background before we evaluate specific OO (object-oriented) languages in Chapter 14. It will also help throw some characteristics of the Unix style of non-OO programming into sharper relief.

We observed above that the Unix tradition of modularity is one of thin glue, a minimalist approach with few layers of abstraction between the hardware and the top-level objects of a program. Part of this is the influence of C. It takes serious effort to simulate true objects in C. Because that’s so, piling up abstraction layers is an exhausting thing to do. Thus, object hierarchies in C tend to be relatively flat and transparent. Even when Unix programmers use other languages, they tend to want to carry over the thin-glue/shallow-layering style that Unix models have taught them.

OO languages make abstraction easy—perhaps too easy. They encourage architectures with thick glue and elaborate layers. This can be good when the problem domain is truly complex and demands a lot of abstraction, but it can backfire badly if coders end up doing simple things in complex ways just because they can.

All OO languages show some tendency to suck programmers into the trap of excessive layering. Object frameworks and object browsers are not a substitute for good design or documentation, but they often get treated as one. Too many layers destroy transparency: It becomes too difficult to see down through them and mentally model what the code is actually doing. The Rules of Simplicity, Clarity, and Transparency get violated wholesale, and the result is code full of obscure bugs and continuing maintenance problems.

This tendency is probably exacerbated because a lot of programming courses teach thick layering as a way to satisfy the Rule of Representation. In this view, having lots of classes is equated with embedding knowledge in your data. The problem with this is that too often, the ’smart data’ in the glue layers is not actually about any natural entity in whatever the program is manipulating—it’s just about being glue. (One sure sign of this is a proliferation of abstract subclasses or ’mixins’.)

Another side effect of OO abstraction is that opportunities for optimization tend to disappear. For example, a + a + a + a can become a * 4 and even a << 2 if a is an integer. But if one creates a class with operators, there is nothing to indicate if they are commutative, distributive, or associative. Since one isn’t supposed to look inside the object, it’s not possible to know which of two equivalent expressions is more efficient. This isn’t in itself a good reason to avoid using OO techniques on new projects; that would be premature optimization. But it is reason to think twice before transforming non-OO code into a class hierarchy.

Unix programmers tend to share an instinctive sense of these problems. This tendency appears to be one of the reasons that, under Unix, OO languages have failed to displace non-OO workhorses like C, Perl (which actually has OO facilities, but they’re not heavily used), and shell. There is more vocal criticism of OO in the Unix world than orthodoxy permits elsewhere; Unix programmers know when not to use OO; and when they do use OO languages, they spend more effort on trying to keep their object designs uncluttered. As the author of The Elements of Networking Style once observed in a slightly different context [Padlipsky]: “If you know what you’re doing, three layers is enough; if you don’t, even seventeen levels won’t help”.

One reason that OO has succeeded most where it has (GUIs, simulation, graphics) may be because it’s relatively difficult to get the ontology of types wrong in those domains. In GUIs and graphics, for example, there is generally a rather natural mapping between manipulable visual objects and classes. If you find yourself proliferating classes that have no obvious mapping to what goes on in the display, it is correspondingly easy to notice that the glue has gotten too thick.

One of the central challenges of design in the Unix style is how to combine the virtue of detachment (simplifying and generalizing problems from their original context) with the virtue of thin glue and shallow, flat, transparent hierarchies of code and design.

We’ll return to some of these points and apply them when we discuss object-oriented languages in Chapter 14.


### 4.6 Coding for Modularity
Modularity is expressed in good code, but it primarily comes from good design. Here are some questions to ask about any code you work on that might help you improve its modularity:

• How many global variables does it have? Global variables are modularity poison, an easy way for components to leak information to each other in careless and promiscuous ways.8

8 Globals also mean your code cannot be reentrant; that is, multiple instances in the same process are likely to step on each other.

• Is the size of your individual modules in Hatton’s sweet spot? If your answer is “No, many are larger”, you may have a long-term maintenance problem. Do you know what your own sweet spot is? Do you know what it is for other programmers you are cooperating with? If not, best be conservative and stick to sizes near the low end of Hatton’s range.

• Are the individual functions in your modules too large? This is not so much a matter of line count as it is of internal complexity. If you can’t informally describe a function’s contract with its callers in one line, the function is probably too large.9

9 Many years ago, I learned from Kernighan & Plauger’s The Elements of Programming Style a useful rule. Write that one-line comment immediately after the prototype of your function. For every function, without exception.

Personally I tend to break up a subprogram when there are too many local variables. Another clue is [too many] levels of indentation. I rarely look at length.

—Ken Thompson

• Does your code have internal APIs—that is, collections of function calls and data structures that you can describe to others as units, each sealing off some layer of function from the rest of the code? A good API makes sense and is understandable without looking at the implementation behind it. The classic test is this: Try to describe it to another programmer over the phone. If you fail, it is very probably too complex, and poorly designed.

• Do any of your APIs have more than seven entry points? Do any of your classes have more than seven methods each? Do your data structures have more than seven members?

• What is the distribution of the number of entry points per module across the project?10 Does it seem uneven? Do the modules with lots of entry points really need that many? Module complexity tends to rise as the square of the number of entry points, too—yet another reason simple APIs are better than complicated ones.

10 A cheap way to collect this information is to analyze the tags files generated by a utility like etags(1) or ctags(1).

You might find it instructive to compare these with our checklist of questions about transparency, and discoverability in Chapter 6.

## 5. Textuality: Good Protocols Make Good Practice

It’s a well-known fact that computing devices such as the abacus were invented thousands of years ago. But it’s not well known that the first use of a common computer protocol occurred in the Old Testament. This, of course, was when Moses aborted the Egyptians’ process with a control-sea.

rec.arts.comics, February 1992
—Tom Galloway

In this chapter, we’ll look at what the Unix tradition has to tell us about two different kinds of design that are closely related: the design of file formats for retaining application data in permanent storage, and the design of application protocols for passing data and commands between cooperating programs, possibly over a network.

What unifies these two kinds of design is that they both involve the serialization of in-memory data structures. For the internal operation of computer programs, the most convenient representation of a complex data structure is one in which all fields have the machine’s native data format (e.g. two’s-complement binary for integers) and all pointers are actual memory addresses (as opposed, say, to being named references). But these representations are not well suited to storage and transmission; memory addresses in the data structure lose their meaning outside memory, and emitting raw native data formats causes interoperability problems passing data between machines with different conventions (big- vs. little-endian, say, or 32-bit vs. 64-bit).

For transmission and storage, the traversable, quasi-spatial layout of data structures like linked lists needs to be flattened or serialized into a byte-stream representation from which the structure can later be recovered. The serialization (save) operation is sometimes called marshaling and its inverse (load) operation unmarshaling. These terms are usually applied with respect to objects in an OO language like C++ or Python or Java, but could be used with equal justice of operations like loading a graphics file into the internal storage of a graphics editor and saving it out after modifications.

A significant percentage of what C and C++ programmers maintain is ad-hoc code for marshaling and unmarshaling operations—even when the serialized representation chosen is as simple as a binary structure dump (a common technique under non-Unix environments). Modern languages like Python and Java tend to have built-in unmarshal and marshal functions that can be applied to any object or byte-stream representing an object, and that reduce this labor substantially.

But these naïve methods are often unsatisfactory for various reasons, including both the machine-interoperability problems we mentioned above and the negative trait of being opaque to other tools. When the application is a network protocol, economy may demand that an internal data structure (such as, say, a message with source and destination addresses) be serialized not into a single blob of data but into a series of attempted transactions or messages which the receiving machine may reject (so that, for example, a large message can be rejected if the destination address is invalid).

Interoperability, transparency, extensibility, and storage or transaction economy: these are the important themes in designing file formats and application protocols. Interoperability and transparency demand that we focus such designs on clean data representations, rather than putting convenience of implementation or highest possible performance first. Extensibility also favors textual protocols, since binary ones are often harder to extend or subset cleanly. Transaction economy sometimes pushes in the opposite direction—but we shall see that putting that criterion first is a form of premature optimization that it is often wise to resist.

Finally, we must note a difference between data file formats and the run-control files that are often used to set the startup options of Unix programs. The most basic difference is that (with sporadic exceptions like GNU Emacs’s configuration interface) programs don’t normally modify their own run-control files—the information flow is one-way, from file read at startup time to application settings. Data-file formats, on the other hand, associate properties with named resources and are both read and written by their applications. Configuration files are generally hand-edited and small, whereas data files are program-generated and can become arbitrarily large.

Historically, Unix has related but different sets of conventions for these two kinds of representation. The conventions for run control files are surveyed in Chapter 10; only conventions for data files are examined in this chapter.


### 5.1 The Importance of Being Textual
Pipes and sockets will pass binary data as well as text. But there are good reasons the examples we’ll see in Chapter 7 are textual: reasons that hark back to Doug McIlroy’s advice quoted in Chapter 1. Text streams are a valuable universal format because they’re easy for human beings to read, write, and edit without specialized tools. These formats are (or can be designed to be) transparent.

Also, the very limitations of text streams help enforce encapsulation. By discouraging elaborate representations with rich, densely encoded structure, text streams also discourage programs from being promiscuous with each other about their internal states and help enforce encapsulation. We’ll return to this point at the end of Chapter 7 when we discuss RPC.

When you feel the urge to design a complex binary file format, or a complex binary application protocol, it is generally wise to lie down until the feeling passes. If performance is what you’re worried about, implementing compression on the text protocol stream either at some level below or above the application protocol will give you a cleaner and perhaps better-performing design than a binary protocol (text compresses well, and quickly).

A bad example of binary formats in Unix history was the way device-independent troff read a binary file containing device information, supposedly for speed. The initial implementation generated that binary file from a text description in a somewhat unportable way. Faced with a need to port ditroff quickly to a new machine, rather than reinvent the binary goo, I ripped it out and just had ditroff read the text file. With carefully crafted file-reading code, the speed penalty was negligible.

—Henry Spencer

Designing a textual protocol tends to future-proof your system. One specific reason is that ranges on numeric fields aren’t implied by the format itself. Binary formats usually specify the number of bits allocated to a given value, and extending them is difficult. For example, IPv4 only allows 32 bits for an address. To extend address size to 128 bits (as done by IPv6) requires a major revamping.1 In contrast, if you need a larger value in a text format, just write it. It may be that a given program can’t receive values in that range, but it’s usually easier to modify the program than to modify all the data stored in that format.

1 There is a legend that some early airline reservation systems allocated exactly one byte for a plane’s passenger count. Supposedly they became very confused by the arrival of the Boeing 747, the first plane that could carry more than 255 passengers.

The only good justification for a binary protocol is if you’re going to be manipulating large enough data sets that you’re genuinely worried about getting the most bit-density out of your media, or if you’re very concerned about the time or instruction budget required to interpret the data into an in-core structure. Formats for large images and multimedia are sometimes an example of the former, and network protocols with hard latency requirements sometimes an example of the latter.

The reciprocal problem with SMTP or HTTP-like text protocols is that they tend to be expensive in bandwidth and slow to parse. The smallest X request is 4 bytes: the smallest HTTP request is about 100 bytes. X requests, including amortized overhead of transport, can be executed in the order of 100 instructions; at one point, an Apache [web server] developer proudly indicated they were down to 7000 instructions. For graphics, bandwidth becomes everything on output; hardware is designed such that these days the graphics-card bus is the bottleneck for small operations, so any protocol had better be very tight if it is not to be a worse bottleneck. This is the extreme case.

—Jim Gettys

These concerns are valid in other extreme cases as well as in X—for example, in the design of graphics file formats intended to hold very large images. But they are usually just another case of premature-optimization fever. Textual formats don’t necessarily have much lower bit density than binary ones; they do after all use seven out of eight bits per byte. And what you gain by not having to parse text, you generally lose the first time you need to generate a test load, or to eyeball a program-generated example of your format and figure out what’s in there.

In addition, the kind of thinking that goes into designing tight binary formats tends to fall down on making them cleanly extensible. The X designers experienced this:

Against the current X framework is the fact we didn’t design enough of a structure to make it easier to ignore trivial extensions to the protocol; we can do this some of the time, but a bit better framework would have been good.

—Jim Gettys

When you think you have an extreme case that justifies a binary file format or protocol, you need to think very carefully about extensibility and leaving room in the design for growth.


#### 5.1.1 Case Study: Unix Password File Format
On many operating systems, the per-user data required to validate logins and start a user’s session is an opaque binary database. Under Unix, by contrast, it’s a text file with records one per line and colon-separated fields.

Example 5.1 consists of some randomly-chosen example lines:


Example 5.1. Password file example.

images

Without even knowing anything about the semantics of the fields, we can notice that it would be hard to pack the data much tighter in a binary format. The colon sentinel characters would have to have functional equivalents taking at least as much space (usually either count bytes or NULs). The per-user records would either have to have terminators (which could hardly be shorter than a single newline) or else be wastefully padded out to a fixed length.

Actually the prospects for saving space through binary encoding pretty much vanish if you know the actual semantics of the data. The numeric user ID (3rd) and group ID (4th) fields are integers, thus on most machines a binary representation would be at least 4 bytes, and longer than the text for values up to 999. But let’s agree to ignore this for now and suppose the best case that the numeric fields have a 0-255 range.

We could tighten up the numeric fields (3rd and 4th) by collapsing the numerics to single bytes, and the password strings (2nd) to an 8-bit encoding. On this example, that would give about an 8% size decrease.

That 8% of putative inefficiency buys us a lot. It avoids putting an arbitrary limit on the range of the numeric fields. It gives us the ability to modify the password file with any old text editor of our choice, rather than having to build a specialized tool to edit a binary format (though in the case of the password file itself, we have to be extra careful about concurrent edits). And it gives us the ability to do ad-hoc searches and filters and reports on the user account information with text-stream tools such as grep(1).

We do have to be a bit careful about not embedding a colon in any of the textual fields. Good practice is to tell the file write code to precede embedded colons with an escape character, and then to tell the file read code to interpret it. Unix tradition favors backslash for this use.

The fact that structural information is conveyed by field position rather than an explicit tag makes this format faster to read and write, but a bit rigid. If the set of properties associated with a key is expected to change with any frequency, one of the tagged formats described below might be a better choice.

Economy is not a major issue with password files to begin with, as they’re normally read seldom2 and infrequently modified. Interoperability is not an issue, since various data in the file (notably user and group numbers) are not portable off the originating machine. For password files, it’s therefore quite clear that going where the transparency criterion leads was the right thing.

2 Password files are normally read once per user session at login time, and after that occasionally by file-system utilities like ls(1) that must map from numeric user and group IDs to names.


#### 5.1.2 Case Study: .newsrc Format
Usenet news is a worldwide distributed bulletin-board system that anticipated today’s P2P networking by two decades. It uses a message format very similar to that of RFC 822 electronic-mail messages, except that instead of being directed to personal recipients messages are sent to topic groups. Articles posted at any participating site are broadcast to each site that it has registered as a neighbor, and eventually flood-fill to all news sites.

Almost all Usenet news readers understand the .newsrc file, which records which Usenet messages have been seen by the calling user. Though it is named like a run-control file, it is not only read at startup but typically updated at the end of the newsreader run. The .newsrc format has been fixed since the first newsreaders around 1980. Example 5.2 is a representative section from a .newsrc file.


Example 5.2. A .newsrc example.

images

Each line sets properties for the newsgroup named in the first field. The name is immediately followed by a character that indicates whether the owning user is currently subscribed to the group or not; a colon indicates subscription, and an exclamation mark indicates nonsubscription. The remainder of the line is a sequence of comma-separated article numbers or ranges of article numbers, indicating which articles the user has seen.

Non-Unix programmers might have automatically tried to design a fast binary format in which each newsgroup status was described by either a long but fixed-length binary record, or a sequence of self-describing binary packets with internal length fields. The main point of such a binary representation would be to express ranges with binary data in paired word-length fields, in order to avoid the overhead of parsing all the range expressions at startup.

Such a layout could be read and written faster than a textual format, but it would have other problems. A naïve implementation in fixed-length records would have placed artificial length limits on newsgroup names and (more seriously) on the maximum number of ranges of seen-article numbers. A more sophisticated binary-packet format would avoid the length limits, but could not be edited with the user’s eyeballs and fingers—a capability that can be quite useful when you want to reset just some of the read bits in an individual newsgroup. Also, it would not necessarily be portable to different machine types.

The designers of the original newsreader chose transparency and interoperability over economy. The case for going in the other direction was not completely ridiculous; .newsrc files can get very large, and one modern reader (GNOME’s Pan) uses a speed-optimized private format to avoid startup lag. But to other implementers, textual representation looked like a good tradeoff in 1980, and has looked better as machines increased in speed and storage dropped in price.


#### 5.1.3 Case Study: The PNG Graphics File Format
PNG (Portable Network Graphics) is a file format for bitmap graphics. It is like GIF, and unlike JPEG, in that it uses lossless compression and is optimized for applications such as line art and icons rather than photographic images. Documentation and open-source reference libraries of high quality are available at the Portable Network Graphics website <http://www.libpng.org/pub/png/>.

PNG is an excellent example of a thoughtfully designed binary format. A binary format is appropriate since graphics files may contain very large amounts of data, such that storage size and Internet download time would go up significantly if the pixel data were stored textually. Transaction economy was the prime consideration, with transparency sacrificed.3 The designers were, however, careful about interoperability; PNG specifies byte orders, integer word lengths, endianness, and (lack of) padding between fields.

3 Confusingly, PNG supports a different kind of transparency—transparent pixels in the PNG image.

A PNG file consists of a sequence of chunks, each in a self-describing format beginning with the chunk type name and the chunk length. Because of this organization, PNG does not need a release number. New chunk types can be added at any time; the case of the first letter in the chunk type name informs PNG-using software whether or not each chunk can be safely ignored.

The PNG file header also repays study. It has been cleverly designed to make various common kinds of file corruption (e.g., by 7-bit transmission links, or mangling of CR and LF characters) easy to detect.

The PNG standard is precise, comprehensive, and well written. It could serve as a model for how to write file format standards.


### 5.2 Data File Metaformats
A data file metaformat is a set of syntactic and lexical conventions that is either formally standardized or sufficiently well established by practice that there are standard service libraries to handle marshaling and unmarshaling it.

Unix has evolved or adopted metaformats suitable for a wide range of applications. It is good practice to use one of these (rather than an idiosyncratic custom format) wherever possible. The benefits begin with the amount of custom parsing and generation code that you may be able to avoid writing by using a service library. But the most important benefit is that developers and even many users will instantly recognize these formats and feel comfortable with them, which reduces the friction costs of learning new programs.

In the following discussion, when we refer to “traditional Unix tools” we are intending the combination of grep(1), sed(1), awk(1), tr(1), and cut(1) for doing text searches and transformations. Perl and other scripting languages tend to have good native support for parsing the line-oriented formats that these tools encourage.

Here, then, are the standard formats that can serve you as models.


#### 5.2.1 DSV Style
DSV stands for Delimiter-Separated Values. Our first case study in textual metaformats was the /etc/passwd file, which is a DSV format with colon as the value separator. Under Unix, colon is the default separator for DSV formats in which the field values may contain whitespace.

/etc/passwd format (one record per line, colon-separated fields) is very traditional under Unix and frequently used for tabular data. Other classic examples include the /etc/group file describing security groups and the /etc/inittab file used to control startup and shutdown of Unix service programs at different run levels of the operating system.

Data files in this style are expected to support inclusion of colons in the data fields by backslash escaping. More generally, code that reads them is expected to support record continuation by ignoring backslash-escaped newlines, and to allow embedding nonprintable character data by C-style backslash escapes.

This format is most appropriate when the data is tabular, keyed by a name (in the first field), and records are typically short (less than 80 characters long). It works well with traditional Unix tools.

One occasionally sees field separators other than the colon, such as the pipe character | or even an ASCII NUL. Old-school Unix practice used to favor tabs, a preference reflected in the defaults for cut(1) and paste(1); but this has gradually changed as format designers became aware of the many small irritations that ensue from the fact that tabs and spaces are not visually distinguishable.

This format is to Unix what CSV (comma-separated value) format is under Microsoft Windows and elsewhere outside the Unix world. CSV (fields separated by commas, double quotes used to escape commas, no continuation lines) is rarely found under Unix.

In fact, the Microsoft version of CSV is a textbook example of how not to design a textual file format. Its problems begin with the case in which the separator character (in this case, a comma) is found inside a field. The Unix way would be to simply escape the separator with a backslash, and have a double escape represent a literal backslash. This design gives us a single special case (the escape character) to check for when parsing the file, and only a single action when the escape is found (treat the following character as a literal). The latter conveniently not only handles the separator character, but gives us a way to handle the escape character and newlines for free. CSV, on the other hand, encloses the entire field in double quotes if it contains the separator. If the field contains double quotes, it must also be enclosed in double quotes, and the individual double quotes in the field must themselves be repeated twice to indicate that they don’t end the field.

The bad results of proliferating special cases are twofold. First, the complexity of the parser (and its vulnerability to bugs) is increased. Second, because the format rules are complex and underspecified, different implementations diverge in their handling of edge cases. Sometimes continuation lines are supported, by starting the last field of the line with an unterminated double quote—but only in some products! Microsoft has incompatible versions of CSV files between its own applications, and in some cases between different versions of the same application (Excel being the obvious example here).


#### 5.2.2 RFC 822 Format
The RFC 822 metaformat derives from the textual format of Internet electronic mail messages; RFC 822 is the principal Internet RFC describing this format (since superseded by RFC 2822). MIME (Multipurpose Internet Media Extension) provides a way to embed typed binary data within RFC-822-format messages. (Web searches on either of these names will turn up the relevant standards.)

In this metaformat, record attributes are stored one per line, named by tokens resembling mail header-field names and terminated with a colon followed by whitespace. Field names do not contain whitespace; conventionally a dash is substituted instead. The attribute value is the entire remainder of the line, exclusive of trailing whitespace and newline. A physical line that begins with tab or whitespace is interpreted as a continuation of the current logical line. A blank line may be interpreted either as a record terminator or as an indication that unstructured text follows.

Under Unix, this is the traditional and preferred textual metaformat for attributed messages or anything that can be closely analogized to electronic mail. More generally, it’s appropriate for records with a varying set of fields in which the hierarchy of data is flat (no recursion or tree structure).

Usenet news uses it; so do the HTTP 1.1 (and later) formats used by the World Wide Web. It is very convenient for editing by humans. Traditional Unix search tools are still good for attribute searches, though finding record boundaries will be a little more work than in a record-per-line format.

One weakness of RFC 822 format is that when more than one RFC 822 message or record is put in a file, the record boundaries may not be obvious—how is a poor literal-minded computer to know where the unstructured text body of a message ends and the next header begins? Historically, there have been several different conventions for delimiting messages in mailboxes. The oldest and most widely supported, leading each message with a line that begins with the string "From " and sender information, is not appropriate for other kinds of records; it also requires that lines in message text beginning with "From " be escaped (typically with >)—a practice which not infrequently leads to confusion.

Some mail systems use delimiter lines consisting of control characters unlikely to appear in messages, such as several ASCII 01 (control-A) characters in succession. The MIME standard gets around the problem by including an explicit message length in the header, but this is a fragile solution which is very likely to break if messages are ever manually edited. For a somewhat better solution, see the record-jar style described later in this chapter.

For examples of RFC 822 format, look in your mailbox.


#### 5.2.3 Cookie-Jar Format
Cookie-jar format is used by the fortune(1) program for its database of random quotes. It is appropriate for records that are just bags of unstructured text. It simply uses newline followed by %% (or sometimes newline followed by %) as a record separator. Example 5.3 is an example section from a file of email signature quotes:


Example 5.3. A fortune file example.

images

It is good practice to accept whitespace after % when looking for record delimiters. This helps cope with human editing mistakes. It’s even better practice to use %%, and ignore all text from %% to end-of-line.

The cookie-jar separator was originally %%\n. I wanted something a bit more visible than % would have been. In fact, any stuff after the %% is treated as a comment (or at least that’s how I wrote it).

—Ken Arnold

Simple cookie-jar format is appropriate for pieces of text that have no natural ordering, distinguishable structure above word level, or search keys other than their text context.


#### 5.2.4 Record-Jar Format
Cookie-jar record separators combine well with the RFC 822 metaformat for records, yielding a format we’ll call ’record-jar’. If you need a textual format that will support multiple records with a variable repertoire of explicit fieldnames, one of the least surprising and human-friendliest ways to do it would look like Example 5.4.


Example 5.4. Basic data for three planets in a record-jar format.

images

Of course, the record delimiter could be a blank line, but a line consisting of “%%\n” is more explicit and less likely to be introduced by accident during editing (two printable characters are better than one because it can’t be generated by a single-character typo). In a format like this it is good practice to simply ignore blank lines.

If your records have an unstructured text part, your record-jar format is closely approaching a mailbox format. In this case, it’s important that you have a well-defined way to escape the record delimiter so it can appear in text; otherwise, your record reader is going to choke on an ill-formed text part someday. Some technique analogous to byte-stuffing (described later in this chapter) is indicated.

Record-jar format is appropriate for sets of field-attribute associations that are like DSV files, but have a variable repertoire of fields, and possibly unstructured text associated with them.


#### 5.2.5 XML
XML is a very simple syntax resembling HTML—angle-bracketed tags and ampersand-led literal sequences. It is about as simple as a plain-text markup can be and yet express recursively nested data structures. XML is just a low-level syntax; it requires a document type definition (such as XHTML) and associated application logic to give it semantics.

XML is well suited for complex data formats (the sort of things for which the old-school Unix tradition would use an RFC-822-like stanza format) though overkill for simpler ones. It is especially appropriate for formats that have a complex nested or recursive structure of the sort that the RFC 822 metaformat does not handle well. For a good introduction to the format, see XML in a Nutshell [Harold-Means].

Among the hardest things to get right in designing any text file format are issues of quoting, whitespace and other low-level syntax details. Custom file formats often suffer from slightly broken syntax that doesn’t quite match other similar formats. Using a standard format such as XML, which is verifiable and parsed by a standard library, eliminates most of these issues.

—Keith Packard

Example 5.5 is a simple example of an XML-based configuration file. It is part of the kdeprint tool shipped with the open-source KDE office suite hosted under Linux. It describes options for an image-to-PostScript filtering operation, and how to map them into arguments for a filter command. For another instructive example, see the discussion of Glade in Chapter 8.


Example 5.5. An XML example.

images

One advantage of XML is that it is often possible to detect ill-formed, corrupted, or incorrectly generated data through a syntax check, without knowing the semantics of the data.

The most serious problem with XML is that it doesn’t play well with traditional Unix tools. Software that wants to read an XML format needs an XML parser; this means bulky, complicated programs. Also, XML is itself rather bulky; it can be difficult to see the data amidst all the markup.

One application area in which XML is clearly winning is in markup formats for document files (we’ll have more to say about this in Chapter 18). Tagging in such documents tends to be relatively sparse among large blocks of plain text; thus, traditional Unix tools still work fairly well for simple text searches and transformations.

One interesting bridge between these worlds is PYX format—a line-oriented translation of XML that can be hacked with traditional line-oriented Unix text tools and then losslessly translated back to XML. A Web search for “Pyxie” will turn up resources. The xmltk toolkit takes the opposite tack, providing stream-oriented tools analogous to grep(1) and sort(1) for filtering XML documents; Web search for “xmltk” to find it.

XML can be a simplifying choice or a complicating one. There is a lot of hype surrounding it, but don’t become a fashion victim by either adopting or rejecting it uncritically. Choose carefully and bear the KISS principle in mind.


#### 5.2.6 Windows INI Format
Many Microsoft Windows programs use a textual data format that looks like Example 5.6. This example associates optional resources named account, directory, numeric_id, and developer with named projects python, sng, fetchmail, and py-howto. The DEFAULT entry supplies values that will be used when a named entry fails to supply them.


Example 5.6. A .INI file example.

images

This style of data-file format is not native to Unix, but some Linux programs (notably Samba, the suite of tools for accessing Windows file shares from Linux) support it under Windows’s influence. This format is readable and not badly designed, but like XML it doesn’t play well with grep(1) or conventional Unix scripting tools.

The .INI format is appropriate if your data naturally falls into its two-level organization of name-attribute pairs clustered under named records or sections. It’s not good for data with a fully recursive treelike structure (XML is more appropriate for that), and it would be overkill for a simple list of name-value associations (use DSV format for that).


#### 5.2.7 Unix Textual File Format Conventions
There are long-standing Unix traditions about how textual data formats ought to look. Most of these derive from one or more of the standard Unix metaformats we’ve just described. It is wise to follow these conventions unless you have strong and specific reasons to do otherwise.

In Chapter 10 we will discuss a different set of conventions used for program run-control files, but you should notice that it will share some of these same rules (especially about the lexical level, the rules by which characters are assembled into tokens).

• One record per newline-terminated line, if possible. This makes it easy to extract records with text-stream tools. For data interchange with other operating systems, it’s wise to make your file-format parser indifferent to whether the line ending is LF or CR-LF. It’s also conventional to ignore trailing whitespace in such formats; this protects against common editor bobbles.

• Less than 80 characters per line, if possible. This makes the format browseable in an ordinary-sized terminal window. If many records must be longer than 80 characters, consider a stanza format (see below).

• Use # as an introducer for comments. It is good to have a way to embed annotations and comments in data files. It’s best if they’re actually part of the file structure, and so will be preserved by tools that know its format. For comments that are not preserved during parsing, # is the conventional start character.

• Support the backslash convention. The least surprising way to support embedding nonprintable control characters is by parsing C-like backslash escapes—\n for a newline, \r for a carriage return, \t for a tab, \b for backspace, \f for formfeed, \e for ASCII escape (27), \nnn or \onnn or \0nnn for the character with octal value nnn, \xnn for the character with hexadecimal value nn, \dnnn for the character with decimal value nnn, \\ for a literal backslash. A newer convention, but one worth following, is the use of \unnnn for a hexadecimal Unicode literal.

• In one-record-per-line formats, use colon or any run of whitespace as a field separator. The colon convention seems to have originated with the Unix password file. If your fields must contain instances of the separator(s), use a backslash as the prefix to escape them.

• Do not allow the distinction between tab and whitespace to be significant. This is a recipe for serious headaches when the tab settings on your users’ editors are different; more generally, it’s confusing to the eye. Using tab alone as a field separator is especially likely to cause problems; allowing any run of tabs and spaces to be a field separator, on the other hand, works well.

• Favor hex over octal. Hex-digit pairs and quads are easier to eyeball-map into bytes and today’s 32- and 64-bit words than octal digits of three bits each; also marginally more efficient. This rule needs emphasizing because some older Unix tools such as od(1) violate it; that’s a legacy from the instruction field sizes in the machine languages of older PDP minicomputers.

• For complex records, use a ’stanza’ format: multiple lines per record, with a record separator line of %%\n or %\n. The separators make useful visual boundaries for human beings eyeballing the file.

• In stanza formats, either have one record field per line or use a record format resembling RFC 822 electronic-mail headers, with colon-terminated field-name keywords leading fields. The second choice is appropriate when fields are often either absent or longer than 80 characters, or when records are sparse (e.g., often with empty fields).

• In stanza formats, support line continuation. When interpreting the file, either discard backslash followed by whitespace or interpret newline followed by whitespace equivalently to a single space, so that a long logical line can be folded into short (easily editable!) physical lines. It’s also conventional to ignore trailing whitespace in these formats; this convention protects against common editor bobbles.

• Either include a version number or design the format as self-describing chunks independent of each other. If there is even the faintest possibility that the format will have to be changed or extended, include a version number so your code can conditionally do the right thing on all versions. Alternatively, design the format as self-describing chunks so that you can add new chunk types without instantly breaking old code.

• Beware of floating-point round-off problems. Conversion of floating-point numbers from binary to text format and back can lose precision, depending on the quality of the conversion library you are using. If the structure you are marshaling/unmarshaling contains floating point, you should test the conversion in both directions. If it looks like conversion in either direction is subject to roundoff errors, be prepared to dump the floating-point field as raw binary instead, or a string encoding thereof. If you’re coding in C or some language that has access to C printf/scanf, the C99 %a specifier may solve this problem.

• Don’t bother compressing or binary-encoding just part of the file. See below...


#### 5.2.8 The Pros and Cons of File Compression
Many modern Unix projects, such as OpenOffice.org and AbiWord, now use XML compressed with zip(1) or gzip(1) as a data file format. Compressed XML combines space economy with some of the advantages of a textual format—notably, it avoids the problem that binary formats must often allocate space for information that may not be used in particular cases (e.g., for unusual options or large ranges). But there is some dispute about this, dispute which turns on some of the central tradeoffs discussed in this chapter.

On the one hand, experiments have shown that documents in a compressed XML file are usually significantly smaller than the Microsoft Word’s native file format, a binary format that one might imagine would take less space. The reason relates to a fundamental of the Unix philosophy: Do one thing well. Creating a single tool to do the compression job well is more effective than ad-hoc compression on parts of the file, because the tool can look across all the data and exploit all repetition in the information.

Also, by separating the representation design from the particular compression method used, you leave open the possibility of using different compression methods in the future with no more than minimal changes to the actual file parsing—perhaps, with no changes at all.

On the other hand, compression does some damage to transparency. While a human being can estimate from context whether uncompressing the file is likely to show him anything useful, tools such as file(1) cannot as of mid-2003 see through the wrapping.

Some would advocate a less structured compression format—straight gzip(1)-compressed XML data, say, without the internal structure and self-identifying header chunk provided by zip(1). While using a format similar to that of zip(1) solves the identification problem, it means that decoding such files will be tricky for programs written in the simpler scripting languages.

Any of these solutions (straight text, straight binary, or compressed text) may be optimal depending on the relative weight you give to storage economy, discoverability, or making browsing tools as simple as possible to write. The point of the preceding discussion is not to advocate any one of these approaches over the others, but rather to suggest how you can think about the options and design tradeoffs clearly.

This having been said, the truly Unixy solution would probably be to fix file(1) to see file prefixes through the compression—and, failing that, to write a shellscript wrapper around file(1) that would interpret compression as a direction to apply gunzip(1) and take a second look.


### 5.3 Application Protocol Design
In Chapter 7, we’ll discuss the advantages of breaking complicated applications up into cooperating processes speaking an application-specific command set or protocol with each other. All the good reasons for data file formats to be textual apply to these application-specific protocols as well.

When your application protocol is textual and easily parsed by eyeball, many good things become easier. Transaction dumps become much easier to interpret. Test loads become easier to write.

Server processes are often invoked by harness programs such as inetd(8) in such a way that the server sees commands on standard input and ships responses to standard output. We describe this “CLI server” pattern in more detail in Chapter 11.

A CLI server with a command set that is designed for simplicity has the valuable property that a human tester will be able to type commands direct to the server process to probe the software’s behavior.

Another issue to bear in mind is the end-to-end design principle. Every protocol designer should read the classic End-to-End Arguments in System Design [Saltzer]. There are often serious questions about which level of the protocol stack should handle features like security and authentication; this paper provides some good conceptual tools for thinking about them. Yet a third issue is designing application protocols for good performance. We’ll cover that issue in more detail in Chapter 12.

The traditions of Internet application protocol design evolved separately from Unix before 1980.4 But since the 1980s these traditions have become thoroughly naturalized into Unix practice.

4 One relic of this pre-Unix history is that Internet protocols normally use CR-LF as a line terminator rather than Unix’s bare LF.

We’ll illustrate the Internet style by looking at three application protocols that are both among the most heavily used, and are widely regarded among Internet hackers as paradigmatic: SMTP, POP3, and IMAP. All three address different aspects of mail transport (one of the net’s two most important applications, along with the World Wide Web), but the problems they address (passing messages, setting remote state, indicating error conditions) are generic to non-email application protocols as well and are normally addressed using similar techniques.


#### 5.3.1 Case Study: SMTP, a Simple Socket Protocol
Example 5.7 is an example transaction in SMTP (Simple Mail Transfer Protocol), which is described by RFC 2821. In the example, C: lines are sent by a mail transport agent (MTA) sending mail, and S: lines are returned by the MTA receiving it. Text emphasized like this is comments, not part of the actual transaction.


Example 5.7. An SMTP session example.

images

This is how mail is passed among Internet machines. Note the following features: command-argument format of the requests, responses consisting of a status code followed by an informational message, the fact that the payload of the DATA command is terminated by a line consisting of a single dot.

SMTP is one of the two or three oldest application protocols still in use on the Internet. It is simple, effective, and has withstood the test of time. The traits we have called out here are tropes that recur frequently in other Internet protocols. If there is any single archetype of what a well-designed Internet application protocol looks like, SMTP is it.


#### 5.3.2 Case Study: POP3, the Post Office Protocol
Another one of the classic Internet protocols is POP3, the Post Office Protocol. It is also used for mail transport, but where SMTP is a ’push’ protocol with transactions initiated by the mail sender, POP3 is a ’pull’ protocol with transactions initiated by the mail receiver. Internet users with intermittent access (like dial-up connections) can let their mail pile up on a mail-drop machine, then use a POP3 connection to pull mail up the wire to their personal machines.

Example 5.8 is an example POP3 session. In the example, C: lines are sent by the client, and S: lines by the mail server. Observe the many similarities with SMTP. This protocol is also textual and line-oriented, sends payload message sections terminated by a line consisting of a single dot followed by line terminator, and even uses the same exit command, QUIT. Like SMTP, each client operation is acknowledged by a reply line that begins with a status code and includes an informational message meant for human eyes.


Example 5.8. A POP3 example session.

images

There are a few differences. The most obvious one is that POP3 uses status tokens rather than SMTP’s 3-digit status codes. Of course the requests have different semantics. But the family resemblance (one we’ll have more to say about when we discuss the generic Internet metaprotocol later in this chapter) is clear.


#### 5.3.3 Case Study: IMAP, the Internet Message Access Protocol
To complete our triptych of Internet application protocol examples, we’ll look at IMAP, another post office protocol designed in a slightly different style. See Example 5.9; as before, C: lines are sent by the client, and S: lines by the mail server. Text emphasized like this is comments, not part of the actual transaction.


Example 5.9. An IMAP session example.

images

IMAP delimits payloads in a slightly different way. Instead of ending the payload with a dot, the payload length is sent just before it. This increases the burden on the server a little bit (messages have to be composed ahead of time, they can’t just be streamed up after the send initiation) but makes life easier for the client, which can tell in advance how much storage it will need to allocate to buffer the message for processing as a whole.

Also, notice that each response is tagged with a sequence label supplied by the request; in this example they have the form A000n, but the client could have generated any token into that slot. This feature makes it possible for IMAP commands to be streamed to the server without waiting for the responses; a state machine in the client can then simply interpret the responses and payloads as they come back. This technique cuts down on latency.

IMAP (which was designed to replace POP3) is an excellent example of a mature and powerful Internet application protocol design, one well worth study and emulation.


### 5.4 Application Protocol Metaformats
Just as data file metaformats have evolved to simplify serialization for storage, application protocol metaformats have evolved to simplify serialization for transactions across networks. The tradeoffs are a little different in this case; because network bandwidth is more expensive than storage, there is more of a premium on transaction economy. Still, the transparency and interoperability benefits of textual formats are sufficiently strong that most designers have resisted the temptation to optimize for performance at the cost of readability.


#### 5.4.1 The Classical Internet Application Metaprotocol
Marshall Rose’s RFC 3117, On the Design of Application Protocols,5 provides an excellent overview of the design issues in Internet application protocols. It makes explicit several of the tropes in classical Internet application protocols that we observed in our examination of SMTP, POP, and IMAP, and provides an instructive taxonomy of such protocols. It is recommended reading.

5 See RFC 3117 <ftp://ftp.rfc-editor.org/in-notes/rfc3117.txt>.

The classical Internet metaprotocol is textual. It uses single-line requests and responses, except for payloads which may be multiline. Payloads are shipped either with a preceding length in octets or with a terminator that is the line ".\r\n". In the latter case the payload is byte-stuffed; all lines that start with a period get another period prepended, and the receiver side is responsible for both recognizing the termination and stripping away the stuffing. Response lines consist of a status code followed by a human-readable message.

One final advantage of this classical style is that it is readily extensible. The parsing and state-machine framework doesn’t need to change much to accommodate new requests, and it is easy to code implementations so that they can parse unknown requests and return an error or simply ignore them. SMTP, POP3, and IMAP have all been extended in minor ways fairly often during their lifetimes, with minimal interoperability problems. Naïvely designed binary protocols are, by contrast, notoriously brittle.


#### 5.4.2 HTTP as a Universal Application Protocol
Ever since the World Wide Web reached critical mass around 1993, application protocol designers have shown an increasing tendency to layer their special-purpose protocols on top of HTTP, using web servers as generic service platforms.

This is a viable option because, at the transaction layer, HTTP is very simple and general. An HTTP request is a message in an RFC-822/MIME-like format; typically, the headers contain identification and authentication information, and the first line is a method call on some resource specified by a Universal Resource Indicator (URI). The most important methods are GET (fetch the resource), PUT (modify the resource) and POST (ship data to a form or back-end process). The most important form of URI is a URL or Uniform Resource Locator, which identifies the resource by service type, host name, and a location on the host. An HTTP response is simply an RFC-822/MIME message and can contain arbitrary content to be interpreted by the client.

Web servers handle the transport and request-multiplexing layers of HTTP, as well as standard service types like http and ftp. It is relatively easy to write web server plugins that will handle custom service types, and to dispatch on other elements of the URI format.

Besides avoiding a lot of lower-level details, this method means the application protocol will tunnel through the standard HTTP service port and not need a TCP/IP service port of its own. This can be a distinct advantage; most firewalls leave port 80 open, but trying to punch another hole through can be fraught with both technical and political difficulties.

With this advantage comes a risk. It means that your web server and its plugins grow more complex, and cracks in any of that code can have large security implications. It may become more difficult to isolate and shut down problem services. The usual tradeoffs between security and convenience apply.

RFC 3205, On the Use of HTTP As a Substrate,6 has good design advice for anyone considering using HTTP as the underlayer of an application protocol, including a summary of the tradeoffs and problems involved.

6 See RFC 3205 <http://www.faqs.org/rfcs/rfc3205.html>.


#### 5.4.2.1 Case Study: The CDDB/freedb.org Database
Audio CDs consist of a sequence of music tracks in a digital format called CDDA-WAV. They were designed to be played by very simple consumer-electronics devices a few years before general-purpose computers developed enough raw speed and sound capability to decode them on the fly. Because of this, there is no provision in the format for even simple metainformation such as the album and track titles. But modern computer-hosted CD players want this information so the user can assemble and edit play lists.

Enter the Internet. There are (at least two) repositories that provide a mapping between a hash code computed from the track-length table on a CD and artist/album-title/track-title records. The original was cddb.org, but another site called freedb.org which is probably now more complete and widely used. Both sites rely on their users for the enormous task of keeping the database current as new CDs come out; freedb.org arose from a developer revolt after CDDB elected to take all that user-contributed information proprietary.

Queries to these services could have been implemented as a custom application protocol on top of TCP/IP, but that would have required steps such as getting a new TCP/IP port number assigned and fighting to get a hole for it punched through thousands of firewalls. Instead, the service is implemented over HTTP as a simple CGI query (as if the CD’s hash code had been supplied by a user filling in a Web form).

This choice makes all the existing infrastructure of HTTP and Web-access libraries in various programming languages available to support programs for querying and updating this database. As a result, adding such support to a software CD player is nearly trivial, and effectively every software CD player knows how to use them.


#### 5.4.2.2 Case Study: Internet Printing Protocol
Internet Printing Protocol (IPP) is a successful, widely implemented standard for the control of network-accessible printers. Pointers to RFCs, implementations, and much other related material are available at the IETF’s Printer Working Group <http://www.pwg.org/ipp/> site.

IPP uses HTTP 1.1 as a transport layer. All IPP requests are passed via an HTTP POST method call; responses are ordinary HTTP responses. (Section 4.2 of RFC 2568, Rationale for the Structure of the Model and Protocol for the Internet Printing Protocol, does an excellent job of explaining this choice; it repays study by anyone considering writing a new application protocol.)

From the software side, HTTP 1.1 is widely deployed. It already solves many of the transport-level problems that would otherwise distract protocol developers and implementers from concentrating on the domain semantics of printing. It is cleanly extensible, so there is room for IPP to grow. The CGI programming model for handling the POST requests is well understood and development tools are widely available.

Most network-aware printers already embed a web server, because that’s the natural way to make the status of the printer remotely queryable by human beings. Thus, the incremental cost of adding IPP service to the printer firmware is not large. (This is an argument that could be applied to a remarkably wide range of other network-aware hardware, including vending machines and coffee makers7 and hot tubs!)

7 See RFC 2324 <http://www.ietf.org/rfc/rfc2324.txt> and RFC 2325 <http://www.ietf.org/rfc/rfc2325.txt>.

About the only serious drawback of layering IPP over HTTP is that the protocol is completely driven by client requests. Thus there is no space in the model for printers to ship asynchronous alert messages back to clients. (However, smarter clients could run a trivial HTTP server to receive such alerts formatted as HTTP requests from the printer.)


#### 5.4.3 BEEP: Blocks Extensible Exchange Protocol
BEEP (formerly BXXP) is a generic protocol machine that competes with HTTP for the role of universal underlayer for application protocols. There is a niche open because there is not as yet any other more established metaprotocol that is appropriate for truly peer-to-peer applications, as opposed to the client-server applications that HTTP handles well. A project website <http://www.beepcore.org/beepcore/docs/sl-beep.jsp> provides access to standards and open-source implementations in several languages.

BEEP has features to support both client-server and peer-to-peer modes. The authors designed the BEEP protocol and support library so that picking the right options abstracts away messy issues like data encoding, flow control, congestion-handling, support of end-to-end encryption, and assembling a large response composed of multiple transmissions,

Internally, BEEP peers exchange sequences of self-describing binary packets not unlike chunk types in PNG. The design is tuned more for economy and less for transparency than the classical Internet protocols or HTTP, and might be a better choice when data volumes are large. BEEP also avoids the HTTP problem that all requests have to be client-initiated; it would be better in situations in which a server needs to send asynchronous status messages back to the client.

BEEP is still new technology in mid-2003, and has only a few demonstration projects. But the BEEP papers are good analytical surveys of best practice in protocol design; even if BEEP itself fails to gain widespread adoption, the papers will retain considerable tutorial value.


#### 5.4.4 XML-RPC, SOAP, and Jabber
There is a developing trend in application protocol design toward using XML within MIME to structure requests and payloads. BEEP peers use this format for channel negotiations. Three major protocols are going the XML route throughout: XML-RPC and SOAP (Simple Object Access Protocol) for remote procedure calls, and Jabber for instant messaging and presence. All three are XML document types.

XML-RPC is very much in the Unix spirit (its author observes that he learned how to program in the 1970s by reading the original source code for Unix). It’s deliberately minimalist but nevertheless quite powerful, offering a way for the vast majority of RPC applications that can get by on passing around scalar boolean/integer/float/string datatypes to do their thing in a way that is lightweight and easy to understand and monitor. XML-RPC’s type ontology is richer than that of a text stream, but still simple and portable enough to act as a valuable check on interface complexity. Open-source implementations are available. An excellent XML-RPC home page <http://www.xmlrpc.com/> points to specifications and multiple open-source implementations.

SOAP is a more heavyweight RPC protocol with a richer type ontology that includes arrays and C-like structs. It was inspired by XML-RPC, but has been plausibly accused of being an overdesigned victim of the second-system effect. As of mid-2003 the SOAP standard is still a work in progress, but a trial implementation in Apache is tracking the drafts. Open-source client modules in Perl, Python, Tcl, and Java are readily discoverable by a Web search. The W3C draft specification is available on the Web <http://www.w3.org/TR/SOAP/>.

XML-RPC and SOAP, considered as remote procedure call methods, have some associated risks that we discuss at the end of Chapter 7.

Jabber is a peer-to-peer protocol designed to support instant messaging and presence. What makes it interesting as an application protocol is that it supports passing around XML forms and live documents. Specifications, documentation, and open-source implementations are available at the Jabber Software Foundation <http://www.jabber.org/about/overview.html> site.

## 6. Transparency: Let There Be Light

Beauty is more important in computing than anywhere else in technology because software is so complicated. Beauty is the ultimate defense against complexity.

Machine Beauty: Elegance and the Heart of Technology (1998)
—David Gelernter

In the previous chapter we discussed the importance of textual data formats and application protocols, representations that are easy for human beings to examine and interact with. These promote qualities in design that are much valued in the Unix tradition but seldom if ever talked about explicitly: transparency and discoverability.

Software systems are transparent when they don’t have murky corners or hidden depths. Transparency is a passive quality. A program is transparent when it is possible to form a simple mental model of its behavior that is actually predictive for all or most cases, because you can see through the machinery to what is actually going on.

Software systems are discoverable when they include features that are designed to help you build in your mind a correct mental model of what they do and how they work. So, for example, good documentation helps discoverability to a user. Good choice of variable and function names helps discoverability to a programmer. Discoverability is an active quality. To achieve it in your software you cannot merely fail to be obscure, you have to go out of your way to be helpful.1

1 An economically-minded friend comments: “Discoverability is about reducing barriers to entry; transparency is about reducing the cost of living in the code”.

Transparency and discoverability are important for both users and software developers. But they’re important in different ways. Users like these properties in a UI because they mean an easier learning curve. UI transparency and discoverability are a large part of what people mean when they say a UI is ’intuitive’; most of the rest is the Rule of Least Surprise. We’ll examine the properties that make user interfaces pleasant and effective in more depth in Chapter 11.

Software developers like these qualities in the code itself (the part users don’t see) because they so often need to understand it well enough to modify and debug it. Also, a program designed so that its internal data flows are readily comprehensible is more likely to be one that does not fail because of bad interactions that the designer didn’t notice, and more likely to be able to evolve forward gracefully (including accommodating change when new maintainers pick up the baton).

Transparency is a major component of what David Gelernter refers to as “beauty” in this chapter’s epigraph. Unix programmers, borrowing from mathematicians, often use the more specific term “elegance” for the quality Gelernter speaks of. Elegance is a combination of power and simplicity. Elegant code does much with little. Elegant code is not only correct but visibly, transparently correct. It does not merely communicate an algorithm to a computer, but also conveys insight and assurance to the mind of a human that reads it. By seeking elegance in our code, we build better code. Learning to write transparent code is a first, long step toward learning how to write elegant code—and taking care to make code discoverable helps us learn how to make it transparent. Elegant code is both transparent and discoverable.

It may be easier to appreciate the difference between transparency and discoverability with a pair of extreme examples. The Linux kernel source is remarkably transparent (given the intrinsic complexity of what it does) but not at all discoverable—acquiring the minimum knowledge needed to live in the code and understand the idiom of the developers is difficult, but once you do the whole makes sense.2 On the other hand, the Emacs Lisp libraries are discoverable but not transparent. It’s easy to acquire enough knowledge to tweak just one thing, but quite difficult to comprehend the whole system.

2 The Linux kernel makes a number of attempts at discoverability, including the Documentation subdirectory in the Linux kernel source tarball and quite a number of tutorial websites and books. These attempts are frustrated by the speed at which the kernel changes; the documentation has a chronic tendency to fall behind.

In this chapter, we’ll examine features of Unix designs that promote transparency and discoverability not just in UIs but in the parts users don’t normally see. We’ll develop some useful rules you can apply to your coding and development practice. Later on, in Chapter 19 we’ll see how good release-engineering practices (like having a README file with appropriate content) can make your source code as discoverable as your design.

If you need a practical reminder why these qualities are important, remember that the sanity you save by writing transparent, discoverable systems may well be that of your own future self.


### 6.1 Studying Cases
Normal practice in this book has been to intersperse case studies with philosophy. But in this chapter we’ll begin by looking at several Unix designs that exhibit transparency and discoverability, and attempt to draw lessons from them only after all have been presented. Each major point of the analysis in the latter half of this chapter draws on several of these, and the arrangement avoids forward references to case studies the reader hasn’t seen yet.


#### 6.1.1 Case Study: audacity
First, we’ll look at an example of transparency in UI design. It is audacity, an open-source editor for sound files that runs on Unix systems, Mac OS X, and Windows. Sources, downloadable binaries, documentation, and screen shots are available at the project site <http://audacity.sourceforge.net/>.

This program supports cutting, pasting, and editing of audio samples. It supports multitrack editing and mixing. The UI is superbly simple; the sound waveforms are shown in the audacity window. The image of the waveform can be cut and pasted; operations on that image are directly reflected in the audio sample as soon as they are performed.


Figure 6.1. Screen shot of audacity.

image

Multitrack editing is supported in the simplest possible way; the screen splits into multiple per-track displays in a spatial relationship that conveys their concurrency and makes it easy to match features by inspection. Tracks can be dragged right or left with the mouse to change their relative timing.

Several features of this UI are subtly excellent and worthy of emulation: the large, easily visible and clickable operation buttons with distinguishing colors, the presence of an undo command that removes most of the risk from experimentation, the volume slider that makes softness/loudness visually obvious in its shape.

But these are details. The central virtue of this program is that it has a superbly transparent and natural user interface, one that erects as few barriers between the user and the sound file as possible.


#### 6.1.2 Case Study: fetchmail’s -v option
fetchmail is a network gateway program. Its main purpose is to translate between POP3 or IMAP remote-mail protocols and the Internet’s native SMTP protocol for email exchange. It is in extremely widespread use on Unix machines that use intermittent SLIP or PPP connections to Internet service providers, and as such probably touches an appreciable fraction of the Internet’s mail traffic.

fetchmail has no fewer than 60 command-line options (which, as we’ll establish later in this book, is probably too many), and a number of other options that are settable from the run-control file but not from the command line. Of all these, the most important—by far—is -v, the verbose option.

When -v is on, fetchmail dumps each one of its POP, IMAP, and SMTP transactions to standard output as they happen. A developer can actually see the code doing protocol with remote mailservers and the mail transport program it forwards to, in real time. Users can send session transcripts with their bug reports. Example 6.1 shows a representative session transcript.


Example 6.1. An example fetchmail -v transcript.

images

images

images

The -v option makes what fetchmail is doing discoverable (by letting you see the protocol exchanges). This is immensely useful. I considered it so important that I wrote special code to mask account passwords out of -v transaction dumps so that they could be passed around and posted without anyone having to remember to edit sensitive information out of them.

This turned out to be a good call. At least eight out of ten problems reported get diagnosed within seconds of a knowledgeable person’s eyes seeing a session transcript. There are several knowledgeable people on the fetchmail mailing list—in fact, because most bugs are easy to diagnose, I seldom have to handle them myself.

Over the years, fetchmail has acquired a reputation as a rather bulletproof program. It can be misconfigured, but it very seldom outright breaks. Betting that this has nothing to do with the fact that the exact circumstances of eight out of ten bugs are rapidly discoverable would not be smart.

We can learn from this example. The lesson is this: Don’t let your debugging tools be mere afterthoughts or treat them as throwaways. They are your windows into the code; don’t just knock crude holes in the walls, finish and glaze them. If you plan to keep the code maintained, you’re always going to need to let light into it.


#### 6.1.3 Case Study: GCC
GCC, the GNU C compiler used on most modern Unixes, is perhaps an even better example of engineering for transparency. GCC is organized as a sequence of processing stages knit together by a driver program. The stages are: preprocessor, parser, code generator, assembler, and linker.

Each of the first three stages takes in a readable textual format and emits a readable textual format (the assembler has to emit and the linker to accept binary formats, pretty much by definition). With various command-line options of the gcc(1) driver, you can see not just the results after C preprocessing, after assembly generation, and after object code generation—but you can also monitor the results of many intermediate steps in parsing and code generation.

This is exactly the structure of cc, the first (PDP-11) C compiler.

—Ken Thompson

There are many benefits of this organization. One that is particularly important for GCC is regression testing.3 Because most of the various intermediate formats are textual, deviations from expected results in a regression test are easily spotted and analyzed using simple textual diff operations on the intermediate results; there is no need for specialist dump-analysis tools that may well harbor their own bugs, and in any case would represent an additional maintenance burden.

3 Regression testing is a method for detecting bugs introduced as software is modified. It consists of periodically checking the output of the changing software for some fixed test input against a snapshot of output captured at an earlier stage of the process and known (or assumed) to be correct.

The design pattern to extract from this example is that the driver program has monitoring switches that merely (but sufficiently) expose the textual data flows among the components. As with fetchmail’s -v option, these options are not afterthoughts; they are designed in for discoverability.


#### 6.1.4 Case Study: kmail
kmail is the GUI mailreader distributed with the KDE environment. The kmail UI is tastefully and well designed, with many good features including automatic display of enclosed images in a MIME multipart and support for PGP key encryption/decryption. It is friendly to end-users—my beloved but nontechie wife uses and enjoys it.

Many mail user agents make one gesture in the direction of discoverability by having a command that toggles display of all the mail headers, as opposed to a select few like From and Subject. The UI of kmail takes this a long step further.

A running kmail displays status notifications in a one-line subwindow at the bottom of its window, in small type over a steel-gray background clearly modeled on the Netscape/Mozilla status bar. When you open a mailbox, for example, the status bar displays counts of total and unread messages. The visual presentation is unobtrusive; it is easy to ignore the notifications, but also easy to focus on them if you want to.


Figure 6.2. Screen shot of kmail.

image

The kmail GUI is good user-interface design. It’s informative, but not distracting; it gets around the reason we adduce in Chapter 11 that the best policy for Unix tools operating normally is usually silence. The authors showed excellent taste in borrowing the look and feel of the browser status bar.

But the extent of the kmail developers’ tastefulness will not become clear until you have to troubleshoot an installation that is having trouble sending mail. If you watch closely during the send, you will observe that each line of the SMTP transaction with the remote mail transport is echoed into the kmail status bar as it happens.

The kmail developers neatly avoid a trap that often makes GUI programs like kmail a terrible pain in a troubleshooter’s fundament. Most design teams with kmail’s objectives would have suppressed those messages entirely, fearing that they would give Aunt Tillie a touch of the vapors that would drive her back to the meretricious pseudo-simplicity of a Windows box.

Instead, they designed for transparency—they made the transaction messages show, but also made them visually easy to ignore. By getting the presentation right, they managed to please both Aunt Tillie and her geeky nephew Melvin who fixes her computer problems. This was brilliant; it’s a technique other GUI interfaces could and should emulate.

Ultimately, of course, the visibility of those messages is good for Aunt Tillie, because they mean Melvin is far less likely to throw up his hands in frustration while trying to solve her email problems.

The lesson here is clear. Dumbing down your UI is only the half-smart thing to do. The really smart thing is to find a way to leave the details accessible, but make them unobtrusive.


#### 6.1.5 Case Study: SNG
The program sng translates between PNG format and an all-text representation of it (SNG or Scriptable Network Graphics format) that can be examined and modified with an ordinary text editor. Run on a PNG file, it produces an SNG file; run on an SNG file, it recovers the equivalent PNG. The transformation is 100% faithful and lossless in both directions.

In syntactic style, SNG resembles CSS (Cascading Style Sheets), another language for controlling presentation of graphics; this makes at least a gesture in the direction of the Rule of Least Surprise. Here is a test example:


Example 6.2. An SNG Example.

images

images

The point of this tool is to enable users to edit various obscure PNG chunk types that are not necessarily supported by conventional graphics editors. Rather than writing special-purpose code to grovel through the PNG binary format, the user can simply flip an image into an all-text representation, edit that, and massage it back. Another potential application is in making images amenable to version control; under most version-control systems, text files are much easier to manage than binary blobs, and diff operations on SNG representations actually have some possibility of yielding useful information.

The gains here go beyond the time not spent writing special-purpose code for manipulating binary PNGs, however. The code of the sng program itself is not especially transparent, but it promotes transparency in larger systems of programs by making the entire contents of PNGs discoverable.


#### 6.1.6 Case Study: The Terminfo Database
The terminfo database is a collection of descriptions of video-display terminals. Each entry describes the escape sequences that perform various manipulations on the terminal screen, such as inserting or deleting lines, erasing from the cursor position to end of line or screen, or beginning and ending screen highlights such as reverse video, underline, or blink.

The terminfo database is primarily used by the curses(3) libraries. These underlie the “roguelike” interface style we discuss in Chapter 11, and some very widely used programs such as mutt(1), lynx(1), and slrn(1). Though the terminal emulators such as xterm(1) that run on today’s bitmapped displays all have capabilities that are minor variations on those of the ANSI X3.64 standard and the venerable VT100 terminal, there is still enough variation that hardwiring ANSI capabilities into applications would be a bad idea. Terminfo is also worth studying because problems that are logically similar to the one it addressed arise constantly in managing other kinds of peripheral hardware that doesn’t have a standard way to report their own capabilities.

The design of terminfo benefits from experience with an earlier capability format called termcap. The database of termcap descriptions lived in a textual format in one big file, /etc/termcap; though this format is now obsolete, your Unix system almost certainly includes a copy.

Normally, the key used to look up your terminal type entry is the environment variable TERM, which for purposes of this case study is set by magic.4 Applications that use terminfo (or termcap) pay a small penalty in startup lag; when the curses(3) library initializes itself, it has to look up the entry corresponding to TERM and load the entry into memory.

4 Actually, TERM is set by the system at login time. For actual terminals on serial lines, the mapping from tty lines to TERM values is set from a system configuration file at boot time; the details vary among Unixes. Terminal emulators like xterm(1) set this variable themselves.

Experience with termcap showed that the startup penalty was dominated by the time required to parse the textual representation of capabilities. Accordingly, terminfo entries are binary structure dumps that can be marshaled and unmarshaled more quickly. There is a master textual format for the entire database, the terminfo capability file. That file (or individual entries) can be compiled to binary form with the terminfo compiler tic(1); binary entries can be decompiled to the editable text format by infocmp(1).

The design superficially contradicts the advice we gave in Chapter 5 against binary caches, but this is actually the extreme case in which that’s a good tactic. Edits to the text masters are very rare—in fact, Unixes normally ship with the terminfo database precompiled and the text master serving primarily as documentation. Thus, the synchronization and inconsistency problems that would normally militate against this approach almost never arise.

The designers of terminfo could have optimized for speed in a second way. The entire database of binary entries could have been put in some kind of big opaque database file. What they actually did instead was more clever and more in the Unix spirit. Terminfo entries live in a directory hierarchy, usually on modern Unixes under /usr/share/terminfo. Consult the terminfo(5) man page to find the location on your system.

If you look in the terminfo directory, you’ll see subdirectories named by single printable characters. Under each of these are the entries for each terminal type that has a name beginning with that letter. The goal of this organization was to avoid having to do a linear search of a very large directory; under more modern Unix file systems, which represent directories with B-trees or other structures optimized for fast lookup, the subdirectories won’t be necessary.

I found that even on a fairly modern Unix, splitting a big directory up into subdirectories can improve performance substantially. It was tens of thousands of files, an authorized-user database for a big educational institution, on a late-model DEC Alpha running DEC’s Unix. (Subdirectories named by first and last letter of name—e.g., “johnson” would be in directory “j_n”—worked best of the schemes we tested. Using the first two letters wasn’t nearly as good, because there were a lot of systematically-generated names which differed only toward the end.) This may just say that sophisticated directory indexing is still not as common as it should be... but even so, that makes an organization which works well without it more portable than one which requires it.

—Henry Spencer

Thus, the cost of opening a terminfo entry is two file system lookups and a file open. But since mining the same entry from one big database would have required a lookup and open for the database, the incremental cost for terminfo’s organization is at most one file system lookup. Actually, it’s less than that; it’s the cost difference between one file system lookup and whatever retrieval method the one big database would have used. This is probably marginal, and quite tolerable once per application at startup time.

Terminfo uses the file system itself as a simple hierarchical database. This is a superb bit of constructive laziness, obeying the Rule of Economy and the Rule of Transparency. It means that all the ordinary tools for navigating, examining and modifying the file system can be used to navigate, examine, and modify the terminfo database; no special ones (other than tic(1) and infocmp(1) for packing and unpacking the individual records) need to be written and debugged. It also means that work on speeding up database access would be work on speeding up the file system itself, tuning that would benefit many more applications than just users of curses(3).

There is one additional advantage of this organization that doesn’t come up in the terminfo case; you get to use Unix’s permissions mechanism rather than having to invent your own access-control layer with its own bugs. This falls out as a consequence of adopting the “everything is a file” philosophy of Unix rather than trying to fight it.

The terminfo directory layout is rather space-inefficient on most Unix file systems. The entries are usually between 400 and 1400 bytes long, but file systems normally allocate a minimum of 4K for every nonempty disk file. The designers accepted this cost for the same reason they chose a packed binary format, to cut the startup latency of terminfo-using programs to a minimum. Disk capacity for constant price has exploded over a thousandfold since, tending to vindicate that decision.

The contrast with the formats used by the Microsoft Windows  registry files is instructive. Registries are property databases used by both Windows itself and applications. Each registry lives in one big file. Registries contain a mix of text and binary data that requires specialized editing tools. The one-big-file approach leads, among other things, to the notorious ’registry creep’ phenomenon; average access time rises without bound as new entries are added. Because there is no standard API for editing the registry provided by the system, applications use ad-hoc code to edit it themselves, making it notoriously subject to corruption that can lock up the entire system.

Using the Unix file system as a database is a tactic other applications with simple database requirements might do well to emulate. Good reasons not to do it are more likely to have to do with the database keys not naturally looking like filenames than they are with any performance problems. In any case, it’s the sort of good fast hack that can be very useful in prototyping.


#### 6.1.7 Case Study: Freeciv Data Files
Freeciv is an open-source strategy game inspired by Sid Meier’s classic Civilization II. In it, each player begins with a wandering band of neolithic nomads and builds a civilization. Player civilizations may explore and colonize the world, fight wars, engage in trade, and research technological advances. Some players may actually be artificial intelligences; solitaire play against these can be challenging. One wins either by conquering the world or by being the first player to reach a technology level sufficient to get a starship to Alpha Centauri. Sources and documentation are available at the project site <http://www.freeciv.org/>.


Figure 6.3. Main window of a Freeciv game.

image

In Chapter 7 we’ll exhibit the Freeciv strategy game as an example of client-server partitioning, with the server maintaining shared state and the client concentrating on GUI presentation. But this game has another notable architectural feature; much of the game’s fixed data, rather than being wired into the server code, is expressed in a property registry read in by the game server at startup time.

The game’s registry files are written in a textual data-file format that assembles text strings (with associated text and numeric properties) into various internal lists of important data (such as nations and unit types) in the game server. The minilanguage has an include directive, so game data can be broken up into semantic units (different files) that are each separately editable. This design choice has been carried through to such an extent that it’s possible to define new nations and new unit types simply by creating new declarations in the data files, without touching the server code at all.

The Freeciv server’s startup parsing has an interesting feature that creates something of a conflict between two of Unix’s design rules, and is therefore worth closer examination. The server ignores property names it doesn’t know how to use. This makes it possible to declare properties that the server doesn’t yet use without breaking the startup parsing. It means that development of the game data (policy) and the server engine (mechanism) can be cleanly separated. On the other hand, it also means startup parsing won’t catch simple misspellings of attribute names. This quiet failure seems to violate the Rule of Repair.

To resolve this conflict, notice that it’s the server’s job to use the registry data, but the task of carefully error-checking that data could be handed off to another program to be run by human editors each time the registry is modified. One Unix solution would be a separate auditing program that analyzes either a machine-readable specification of the ruleset format or the source of the server code to determine the set of properties it uses, parses the Freeciv registry to determine the set of properties it provides, and prepares a difference report.5

5 The ur-ancestor of such validator programs under Unix was lint, a validator for C code separate from the C compiler. Though GCC has absorbed its functions, old Unix hands are still apt to refer to the process of running a validator as ’linting’, and the name survives in utilities such as xmllint.

The aggregate of all Freeciv data files is functionally similar to a Windows registry, and even uses a syntax resembling the textual portions of registries. But the creep and corruption problems we noted with the Windows registry don’t crop up here because no program (either within or outside the Freeciv suite) writes to these files. It’s a read-only registry edited only by the game’s maintainers.

The performance impact of data-file parsing is minimized because for each file the operation is performed only once, at either client or server startup time.


### 6.2 Designing for Transparency and Discoverability
To design for transparency and discoverability, you need to apply every tactic for keeping your code simple, and also concentrate on the ways in which your code is a communication to other human beings. The first questions to ask, after “Will this design work?” are “Will it be readable to other people? Is it elegant?” We hope it is clear by now that these questions are not fluff and that elegance is not a luxury. These qualities in the human reaction to software are essential for reducing its bugginess and increasing its long-term maintainability.


#### 6.2.1 The Zen of Transparency
One pattern that emerges from the examples we’ve examined so far in this chapter is this: If you want transparent code, the most effective route is simply not to layer too much abstraction over what you are manipulating with the code.

In Chapter 4’s section on the value of detachment, our advice was to abstract and simplify and generalize, to try and detach from the particular, accidental conditions under which a design problem was posed. The advice to abstract does not actually contradict the advice against excessive abstractions we’re developing here, because there is a difference between getting free of assumptions and forgetting the problem you’re trying to solve. This is part of what we were driving at when we developed the idea that glue layers need to be kept thin.

One of the main lessons of Zen is that we ordinarily see the world through a haze of preconceptions and fixed ideas that proceed from our desires. To achieve enlightenment, we must follow the Zen teaching not merely to let go of desire and attachment, but to experience reality exactly as it is—without the preconceptions and the fixed ideas getting in the way.

This is excellent pragmatic advice for software designers. It’s part of what’s implicit in the classic Unix advice to be minimalist. Software designers are clever people who form ideas (abstractions) about the application domains they deal with. They organize the software they write around those ideas. Then, when debugging, they often find they have great trouble seeing through those ideas to what is actually going on.

Any Zen master would recognize this problem instantly, yell “Three pounds of flax!”, and probably clout the student a good one.6 Consciously designing for transparency is a slightly less mystical way of addressing it.

6 See the koan called Tozan’s Three Pounds in the Gateless Gate [Mumon].

In Chapter 4 we criticized object-oriented programming in terms likely to prove a bit shocking to programmers who were raised on the 1990s gospel of OO. Object-oriented design doesn’t have to be over-complicated design, but we’ve observed that too often it is. Too many OO designs are spaghetti-like tangles of is-a and has-a relationships, or feature thick layers of glue in which many of the objects seem to exist simply to hold places in a steep-sided pyramid of abstractions. Such designs are the opposite of transparent; they are (notoriously) opaque and difficult to debug.

As we’ve previously noted, Unix programmers are the original zealots about modularity, but tend to go about it in a quieter way. Keeping glue layers thin is part of it; more generally, our tradition teaches us to build lower, hugging the ground with algorithms and structures that are designed to be simple and transparent.

As with Zen art, the simplicity of good Unix code depends on exacting self-discipline and a high level of craft, neither of which are necessarily apparent on casual inspection. Transparency is hard work, but worth the effort for more than merely artistic reasons. Unlike Zen art, software requires debugging—and usually needs continuing maintenance, forward-porting, and adaptation throughout its lifetime. Transparency is therefore more than an esthetic triumph; it is a victory that will be reflected in lower costs throughout the software’s life cycle.


#### 6.2.2 Coding for Transparency and Discoverability
Transparency and discoverability, like modularity, are primarily properties of designs, not code. It is not sufficient to get right the low-level elements of style, such as indenting code in a clear and consistent way or having good variable-naming conventions. These qualities have much more to do with code properties that are less obvious to inspection. Here are a few to think about:

• What is the maximum static depth of your procedure-call hierarchy? That is, leaving out recursions, how many levels of call might a human have to model mentally to understand the operation of the code? Hint: If it’s more than four, beware.

• Does the code have invariant properties7 that are both strong and visible? Invariant properties help human beings reason about code and detect problem cases.

7 An invariant is a property of a software design that is preserved by every operation in it. For example, in most databases it is an invariant that no two records may have the same key. In a C program that correctly manipulates strings, every string buffer must contain a terminating NUL byte on exit from each string function. In an inventory system, no parts count can hold a number less than zero.

• Are the function calls in your APIs individually orthogonal, or do they have too many magic flags and mode bits that have a single call doing multiple tasks? Avoiding mode flags entirely can lead to a cluttered API with too many nigh-identical functions, but the obverse error (lots of easily-forgotten and confusable mode flags) is even more common.

• Are there a handful of prominent data structures or a single global scoreboard that captures the high-level state of the system? Is this state easy to visualize and inspect, or is it diffused among many individual global variables or objects that are hard to find?

• Is there a clean, one-to-one mapping between data structures or classes in your program and the entities in the world that they represent?

• Is it easy to find the portion of the code responsible for any given function? How much attention have you paid to the readability not just of individual functions and modules but of the whole codebase?

• Does the code proliferate special cases or avoid them? Every special case could interact with every other special case; all those potential collisions are bugs waiting to happen. But even more importantly, special cases make the code harder to understand.

• How many magic numbers (unexplained constants) does the code have in it? Is it easy to discover the implementation’s limits (such as critical buffer sizes) by inspection?

It’s best for code to be simple. But if it answers these sorts of questions well, it can be very complex without putting an impossible cognitive burden on a human maintainer.

The reader might find it instructive to compare these with our checklist questions about modularity in Chapter 4.


#### 6.2.3 Transparency and Avoiding Overprotectiveness
Close kin to the programmer tendency to build overelaborate castles of abstractions is a tendency to overprotect others from the low-level details. While it’s not bad practice to hide those details in the program’s normal mode of operation (fetchmail’s -v switch is off by default), they should be discoverable. There’s an important difference between hiding them and making them inaccessible.

Programs that cannot reveal what they are doing make troubleshooting far more difficult. Thus, experienced Unix users actually take the presence of debugging and instrumentation switches as a good sign, and their absence as possibly a bad one. Absence suggests an inexperienced or careless developer; presence suggests one with enough wisdom to follow the Rule of Transparency.

The temptation to overprotect is especially strong in GUI applications targeted for end users, like mail readers. One reason Unix developers have been cool toward GUI interfaces is that, in their designers’ haste to make them ’user-friendly’ each one often becomes frustratingly opaque to anyone who has to solve user problems—or, indeed, interact with it anywhere outside the narrow range predicted by the user-interface designer.

Worse, programs that are opaque about what they are doing tend to have a lot of assumptions baked into them, and to be frustrating or brittle or both in any use case not anticipated by the designer. Tools that look glossy but shatter under stress are not good long-term value.

Unix tradition pushes for programs that are flexible for a broader range of uses and troubleshooting situations, including the ability to present as much state and activity information to the user as the user indicates he is willing to handle. This is good for troubleshooting; it is also good for growing smarter, more self-reliant users.


#### 6.2.4 Transparency and Editable Representations
Another theme that emerges from these examples is the value of programs that flip a problem out of a domain in which transparency is hard into one in which it is easy. Audacity, sng(1) and the tic(1)/infocmp(1) pair all have this property. The objects they manipulate are not readily conformable to the hand and eye; audio files are not visual objects, and although images expressed in PNG format are visual, the complexities of PNG annotation chunks are not. All three applications turn manipulation of their binary file formats into a problem to which human beings can more readily apply intuition and competences gained from everyday experience.

A rule all these examples follow is that they degrade the representation as little as possible—in fact, they translate it reversibly and losslessly. This property is very important, and worth implementing even if there is no obvious application demand for that kind of 100% fidelity. It gives potential users confidence that they can experiment without degrading their data.

All the advantages of textual data-file formats that we discussed in Chapter 5 also apply to the textual formats that sng(1), infocmp(1) and their kin generate. One important application for sng(1) is robotic generation of PNG image annotations by scripts—because sng(1) exists, such scripts are easier to write.

Whenever you face a design problem that involves editing some kind of complex binary object, the Unix tradition encourages asking first off whether you can write a tool analogous to sng(1) or the tic(1)/infocmp(1) pair that can do a lossless mapping to an editable textual format and back. There is no established term for programs of this kind, but we’ll call them textualizers.

If the binary object is dynamically generated or very large, then it may not be practical or possible to capture all the state with a textualizer. In that case, the equivalent task is to write a browser. The paradigm example is fsdb(1), the file-system debugger supported under various Unixes; there is a Linux equivalent called debugfs(1). The psql(1) used to browse PostgreSQL databases, and the smbclient(1) program that can be used to query Windows file shares on a SAMBA-equipped Linux machine, are two more. All five are simple CLI programs that could be driven by scripts and test harnesses.

Writing a textualizer or browser is a valuable exercise for at least four reasons:

• You gain an excellent learning experience. There may be other ways that are as good to learn about the structure of the object, but none that are obviously better.

• You gain the ability to dump the contents of the structure for inspection and debugging. Because such a tool makes dumping easy, you’ll do it more. You’ll get more information, probably leading to more insight.

• You gain the ability to easily generate test loads and unusual cases. This means you are more likely to probe the odd corners of the object’s state space—and to break the associated software, so you can fix it before your users break it.

• You gain code you may be able to reuse. If you’re careful about how you write the browser/textualizer and keep the CLI interpreter properly separated from the marshaling/unmarshaling library, you may find you have code that can be reused for your actual application.

After you’ve done this, you may well discover that it’s possible to apply the “separated engine and interface” pattern (see Chapter 11) using your textualizer/debugger as the engine. All the usual benefits of this pattern will apply.

It is desirable, although often difficult, for a textualizer to be able to read and write even a damaged binary object. For one thing, it lets you generate damaged test cases to stress-test software; for another, it can make emergency repairs a whole lot easier. It may be hard to handle cases in which the structure of the object is messed up, but at least you should handle cases in which the content of the structure is nonsense, e.g., by showing nonsense values in hex and converting the hex back to the values.

—Henry Spencer


#### 6.2.5 Transparency, Fault Diagnosis, and Fault Recovery
Yet another benefit of transparency, related to ease of debugging, is that transparent systems are easier to perform recovery actions on after a bug bites—and, often, more resistant to damage from bugs in the first place.

In comparing the terminfo database with Windows registries we noted that registries are notoriously subject to being corrupted by buggy application code. This can make the entire system unusable. Even if it doesn’t, recovery can be difficult if the corruption confuses the specialized registry-editing tools.

Our Unix case studies illustrate ways that designing for transparency can prevent this class of problem. Because the terminfo database is not one big file, botching one terminfo entry does not make the whole terminfo data set unusable. Fully textual one-big-file formats like termcap are usually parsed with methods which (unlike block reads of binary structure dumps) can recover from single-point errors. Syntax errors in an SNG file can be corrected by hand without requiring specialized editors that might refuse to load a damaged PNG image.

Going back to the kmail case study, that program makes fault diagnosis easier because it obeys the Rule of Repair: SMTP failures are noisy, usefully so. You don’t have to decode a layer of obfuscatory messages generated by kmail itself to see what the interaction with the SMTP server looks like. All you have to do is look in the right place, because kmail is being transparent and not throwing away information about the error state. (It helps that SMTP itself is textual and includes human-readable status messages in its transactions.)

Discoverability tools like textualizers and browsers also make fault diagnosis easier. We’ve already touched on one reason: they make inspecting the state of the system easier. But there is another effect at work as well; textualized versions of data tend to have useful redundancies (such as using whitespace for visual separation as well as explicit delimiters for parsing). These are present to make them easier to read for humans, but also have the effect of making them more resistant to being irreparably trashed by point failures. A corrupted chunk in a PNG file is seldom recoverable, but the human capacity for pattern recognition and reasoning from context might be able to repair the equivalent SNG form.

Over and over again, the Rule of Robustness is clear. Simplicity plus transparency lowers costs, reduces everybody’s stress, and frees people to concentrate on new problems rather than cleaning up after old mistakes.


### 6.3 Designing for Maintainability
Software is maintainable to the extent that people who are not its author can successfully understand and modify it. Maintainability demands more than code that works; it demands code that follows the Rule of Clarity and communicates successfully to human beings as well as the computer.

Unix programmers have a lot of implicit knowledge available to them about what makes for maintainable code, because Unix hosts source code that goes back decades. For reasons we’ll discuss in Chapter 17, Unix programmers learn a tendency to scrap and rebuild rather than patching grubby code (see Rob Pike’s meditation on this subject in Chapter 1). Thus, any sources that have survived more than a decade of evolutionary pressure have been selected for maintainability. These old, successful, well-established projects with maintainable code are the community’s models for practice.

A question Unix programmers—and especially Unix programmers in the open-source world—learn to ask about tools they are evaluating for use is: “Is this code live, dormant, or dead?” Live code has an active developer community attached to it. Dormant code has often become dormant because the pain of maintaining it exceeded its utility to its originators. Dead code has been dormant for so long that it would be easier to reimplement an equivalent from scratch. If you want your code to live, investing effort to make it maintainable (and therefore attractive to future maintainers) will be one of the most effective ways you can spend your time.

Code that is designed to be both transparent and discoverable has gone a long way toward being maintainable. But there are other practices we can observe in the model projects in this chapter that are worth emulating.

One very important practice is an application of the Rule of Clarity: choosing simple algorithms. In Chapter 1 we quoted Ken Thompson: “When in doubt, use brute force”. Thompson understood the full cost of complicated algorithms—not just that they’re more bug-prone when initially implemented, but that they’re harder for maintainers down the line to understand.

Another important practice is the inclusion of hacker’s guides. It has always been highly approved behavior for source code distributions to include guide documents informally describing the key data structures and algorithms in the code. In fact, Unix programmers have often been better about producing hacker’s guides than they are about writing end-user documentation.

The open-source community has seized on and elaborated this custom. Besides being advice to future maintainers, hacker’s guides for open-source projects are also designed to make it easy for casual contributors to add features or fix bugs. The Design Notes file shipped with fetchmail is representative. The Linux kernel sources include literally dozens of these.

In Chapter 19 we’ll describe conventions that Unix developers have evolved for making source code distributions easy to examine and easy to build running code from. These practices, too, promote maintainability.


## 7. Multiprogramming: Separating Processes to Separate Function

If we believe in data structures, we must believe in independent (hence simultaneous) processing. For why else would we collect items within a structure? Why do we tolerate languages that give us the one without the other?

Epigrams in Programming, in ACM SIGPLAN (Vol 17 #9, 1982)
—Alan Perlis

The most characteristic program-modularization technique of Unix is splitting large programs into multiple cooperating processes. This has usually been called ’multiprocessing’ in the Unix world, but in this book we revive the older term ’multiprogramming’ to avoid confusion with multiprocessor hardware implementations.

Multiprogramming is a particularly murky area of design, one in which there are few guidelines to good practice. Many programmers with excellent judgment about how to break up code into subroutines nevertheless wind up writing whole applications as monster single-process monoliths that founder on their own internal complexity.

The Unix style of design applies the do-one-thing-well approach at the level of cooperating programs as well as cooperating routines within a program, emphasizing small programs connected by well-defined interprocess communication or by shared files. Accordingly, the Unix operating system encourages us to break our programs into simpler subprocesses, and to concentrate on the interfaces between these subprocesses. It does this in at least three fundamental ways:

• by making process-spawning cheap;

• by providing methods (shellouts, I/O redirection, pipes, message-passing, and sockets) that make it relatively easy for processes to communicate;

• by encouraging the use of simple, transparent, textual data formats that can be passed through pipes and sockets.

Inexpensive process-spawning and easy process control are critical enablers for the Unix style of programming. On an operating system such as VAX VMS, where starting processes is expensive and slow and requires special privileges, one must build monster monoliths because one has no choice. Fortunately the trend in the Unix family has been toward lower fork(2) overhead rather than higher. Linux, in particular, is famously efficient this way, with a process-spawn faster than thread-spawning on many other operating systems.1

1 See, for example, the results quoted in Improving Context Switching Performance of Idle Tasks under Linux [Appleton].

Historically, many Unix programmers have been encouraged to think in terms of multiple cooperating processes by experience with shell programming. Shell makes it relatively easy to set up groups of multiple processes connected by pipes, running either in background or foreground or a mix of the two.

In the remainder of this chapter, we’ll look at the implications of cheap process-spawning and discuss how and when to apply pipes, sockets, and other interprocess communication (IPC) methods to partition your design into cooperating processes. (In the next chapter, we’ll apply the same separation-of-functions philosophy to interface design.)

While the benefit of breaking programs up into cooperating processes is a reduction in global complexity, the cost is that we have to pay more attention to the design of the protocols which are used to pass information and commands between processes. (In software systems of all kinds, bugs collect at interfaces.)

In Chapter 5 we looked at the lower level of this design problem—how to lay out application protocols that are transparent, flexible and extensible. But there is a second, higher level to the problem which we blithely ignored. That is the problem of designing state machines for each side of the communication.

It is not hard to apply good style to the syntax of application protocols, given models like SMTP or BEEP or XML-RPC. The real challenge is not protocol syntax but protocol logic—designing a protocol that is both sufficiently expressive and deadlock-free. Almost as importantly, the protocol has to be seen to be expressive and deadlock-free; human beings attempting to model the behavior of the communicating programs in their heads and verify its correctness must be able to do so.

In our discussion, therefore, we will focus on the kinds of protocol logic one naturally uses with each kind of interprocess communication.


### 7.1 Separating Complexity Control from Performance Tuning
First, though, we need to dispose of a few red herrings. Our discussion is not going to be about using concurrency to improve performance. Putting that concern before developing a clean architecture that minimizes global complexity is premature optimization, the root of all evil (see Chapter 12 for further discussion).

A closely related red herring is threads (that is, multiple concurrent processes sharing the same memory-address space). Threading is a performance hack. To avoid a long diversion here, we’ll examine threads in more detail at the end of this chapter; the summary is that they do not reduce global complexity but rather increase it, and should therefore be avoided save under dire necessity.

Respecting the Rule of Modularity, on the other hand, is not a red herring; doing so can make your programs—and your life—simpler. All the reasons for process partitioning are continuous with the reasons for module partitioning that we developed in Chapter 4.

Another important reason for breaking up programs into cooperating processes is for better security. Under Unix, programs that must be run by ordinary users, but must have write access to security-critical system resources, get that access through a feature called the setuid bit.2 Executable files are the smallest unit of code that can hold a setuid bit; thus, every line of code in a setuid executable must be trusted. (Well-written setuid programs, however, take all necessary privileged actions first and then drop their privileges back to user level for the remainder of their existence.)

2 A setuid program runs not with the privileges of the user calling it, but with the privileges of the owner of the executable. This feature can be used to give restricted, program-controlled access to things like the password file that nonadministrators should not be allowed to modify directly.

Usually a setuid program only needs its privileges for one or a small handful of operations. It is often possible to break up such a program into cooperating processes, a smaller one that needs setuid and a larger one that does not. When we can do this, only the code in the smaller program has to be trusted. It is in significant part because this kind of partitioning and delegation is possible that Unix has a better security track record3 than its competitors.

3 That is, a better record measured in security breaches per total machine hours of Internet exposure.


### 7.2 Taxonomy of Unix IPC Methods
As in single-process program architectures, the simplest organization is the best. The remainder of this chapter will present IPC techniques roughly in order of escalating complexity of programming them. Before using a later, more complex technique, you should prove by demonstration—with prototypes and benchmark results—that no earlier and simpler technique will do. Often you will surprise yourself.


#### 7.2.1 Handing off Tasks to Specialist Programs
In the simplest form of interprogram cooperation enabled by inexpensive process spawning, a program runs another to accomplish a specialized task. Because the called program is often specified as a Unix shell command through the system(3) call, this is often called shelling out to the called program. The called program inherits the user’s keyboard and display and runs to completion. When it exits, the calling program resumes control of the keyboard and display and resumes execution.4 Because the calling program does not communicate with the called program during the callee’s execution, protocol design is not an issue in this kind of cooperation, except in the trivial sense that the caller may pass command-line arguments to the callee to change its behavior.

4 A common error in programming shellouts is to forget to block signals in the parent while the subprocess runs. Without this precaution, an interrupt typed to the subprocess can have unwanted side effects on the parent process.

The classic Unix case of shelling out is calling an editor from within a mail or news program. In the Unix tradition one does not bundle purpose-built editors into programs that require general text-edited input. Instead, one allows the user to specify an editor of his or her choice to be called when editing needs to be done.

The specialist program usually communicates with its parent through the file system, by reading or modifying file(s) with specified location(s); this is how editor or mailer shellouts work.

In a common variant of this pattern, the specialist program may accept input on its standard input, and be called with the C library entry point popen(..., "w") or as part of a shellscript. Or it may send output to its standard output, and be called with popen(..., "r") or as part of a shellscript. (If it both reads from standard input and writes to standard output, it does so in a batch mode, completing all reads before doing any writes.) This kind of child process is not usually referred to as a shellout; there is no standard jargon for it, but it might well be called a ’bolt-on’.

They key point about all these cases is that the specialist programs don’t handshake with the parent while they are running. They have an associated protocol only in the trivial sense that whichever program (master or slave) is accepting input from the other has to be able to parse it.


#### 7.2.1.1 Case Study: The mutt Mail User Agent
The mutt mail user agent is the modern representative of the most important design tradition in Unix email programs. It has a simple screen-oriented interface with single-keystroke commands for browsing and reading mail.

When you use mutt as a mail composer (either by calling it with an address as a command-line argument or by using one of the reply commands), it examines the process environment variable EDITOR, and then generates a temporary file name. The value of the EDITOR variable is called as a command with the tempfile name as an argument.5 When that command terminates, mutt resumes on the assumption that the temporary file contains the desired mail text.

5 Actually, the above is a slight oversimplification. See the discussion of EDITOR and VISUAL in Chapter 10 for the rest of the story.

Almost all Unix mail- and netnews-composition programs observe the same convention. Because they do, composer implementers don’t need to write a hundred inevitably diverging editors, and users don’t need to learn a hundred divergent interfaces. Instead, users can carry their chosen editors with them.

An important variant of this strategy shells out to a small proxy program that passes the specialist job to an already-running instance of a big program, like an editor or a Web browser. Thus, developers who normally have an instance of emacs running on their X display can set EDITOR=emacsclient, and have a buffer pop open in their emacs when they request editing in mutt. The point of this is not really to save memory or other resources, it’s to enable the user to unify all editing in a single emacs process (so that, for example, cut and paste among buffers can carry along internal emacs state information like font highlighting).


#### 7.2.2 Pipes, Redirection, and Filters
After Ken Thompson and Dennis Ritchie, the single most important formative figure of early Unix was probably Doug McIlroy. His invention of the pipe construct reverberated through the design of Unix, encouraging its nascent do-one-thing-well philosophy and inspiring most of the later forms of IPC in the Unix design (in particular, the socket abstraction used for networking).

Pipes depend on the convention that every program has initially available to it (at least) two I/O data streams: standard input and standard output (numeric file descriptors 0 and 1 respectively). Many programs can be written as filters, which read sequentially from standard input and write only to standard output.

Normally these streams are connected to the user’s keyboard and display, respectively. But Unix shells universally support redirection operations which connect these standard input and output streams to files. Thus, typing

ls >foo


sends the output of the directory lister ls(1) to a file named ’foo’. On the other hand, typing:

wc <foo


causes the word-count utility wc(1) to take its standard input from the file ’foo’, and deliver a character/word/line count to standard output.

The pipe operation connects the standard output of one program to the standard input of another. A chain of programs connected in this way is called a pipeline. If we write

ls | wc


we’ll see a character/word/line count for the current directory listing. (In this case, only the line count is really likely to be useful.)

One favorite pipeline was “bc | speak”—a talking desk calculator. It knew number names up to a vigintillion.

—Doug McIlroy

It’s important to note that all the stages in a pipeline run concurrently. Each stage waits for input on the output of the previous one, but no stage has to exit before the next can run. This property will be important later on when we look at interactive uses of pipelines, like sending the lengthy output of a command to more(1).

It’s easy to underestimate the power of combining pipes and redirection. As an instructive example, The Unix Shell As a 4GL [Schaffer-Wolf] shows that with these facilities as a framework, a handful of simple utilities can be combined to support creating and manipulating relational databases expressed as simple textual tables.

The major weakness of pipes is that they are unidirectional. It’s not possible for a pipeline component to pass control information back up the pipe other than by terminating (in which case the previous stage will get a SIGPIPE signal on the next write). Accordingly, the protocol for passing data is simply the receiver’s input format.

So far, we have discussed anonymous pipes created by the shell. There is a variant called a named pipe which is a special kind of file. If two programs open the file, one for reading and the other for writing, a named pipe acts like a pipe-fitting between them. Named pipes are a bit of a historical relic; they have been largely displaced from use by named sockets, which we’ll discuss below. (For more on the history of this relic, see the discussion of System V IPC below.)


#### 7.2.2.1 Case Study: Piping to a Pager
Pipelines have many uses. For one example, Unix’s process lister ps(1) lists processes to standard output without caring that a long listing might scroll off the top of the user’s display too quickly for the user to see it. Unix has another program, more(1), which displays its standard input in screen-sized chunks, prompting for a user keystroke after displaying each screenful.

Thus, if the user types “ps | more”, piping the output of ps(1) to the input of more(1), successive page-sized pieces of the list of processes will be displayed after each keystroke.

The ability to combine programs like this can be extremely useful. But the real win here is not cute combinations; it’s that because both pipes and more(1) exist, other programs can be simpler. Pipes mean that programs like ls(1) (and other programs that write to standard out) don’t have to grow their own pagers—and we’re saved from a world of a thousand built-in pagers (each, naturally, with its own divergent look and feel). Code bloat is avoided and global complexity reduced.

As a bonus, if anyone needs to customize pager behavior, it can be done in one place, by changing one program. Indeed, multiple pagers can exist, and will all be useful with every application that writes to standard output.

In fact, this has actually happened. On modern Unixes, more(1) has been largely replaced by less(1), which adds the capability to scroll back in the displayed file rather than just forward.6 Because less(1) is decoupled from the programs that use it, it’s possible to simply alias ’more’ to ’less’ in your shell, set the environment variable PAGER to ’less’ (see Chapter 10), and get all the benefits of a better pager with all properly-written Unix programs.

6 The less(1) man page explains the name by observing “Less is more”.


#### 7.2.2.2 Case Study: Making Word Lists
A more interesting example is one in which pipelined programs cooperate to do some kind of data transformation for which, in less flexible environments, one would have to write custom code.

Consider the pipeline

tr -c '[:alnum:]' '[\n*]' | sort -iu | grep -v '^[0-9]*$'


The first command translates non-alphanumerics on standard input to newlines on standard output. The second sorts lines on standard input and writes the sorted data to standard output, discarding all but one copy of spans of adjacent identical lines. The third discards all lines consisting solely of digits. Together, these generate a sorted wordlist to standard output from text on standard input.


#### 7.2.2.3 Case Study: pic2graph
Shell source code for the program pic2graph(1) ships with the groff suite of text-formatting tools from the Free Software Foundation. It translates diagrams written in the PIC language to bitmap images. Example 7.1 shows the pipeline at the heart of this code.


Example 7.1. The pic2graph pipeline.

images

The pic2graph(1) implementation illustrates how much one pipeline can do purely by calling pre-existing tools. It starts by massaging its input into an appropriate form, continues by feeding it through groff(1) to produce PostScript, and finishes by converting the PostScript to a bitmap. All these details are hidden from the user, who simply sees PIC source go in one end and a bitmap ready for inclusion in a Web page come out the other.

This is an interesting example because it illustrates how pipes and filtering can adapt programs to unexpected uses. The program that interprets PIC, pic(1), was originally designed only to be used for embedding diagrams in typeset documents. Most of the other programs in the toolchain it was part of are now semiobsolescent. But PIC remains handy for new uses, such as describing diagrams to be embedded in HTML. It gets a renewed lease on life because tools like pic2graph(1) can bundle together all the machinery needed to convert the output of pic(1) into a more modern format.

We’ll examine pic(1) more closely, as a minilanguage design, in Chapter 8.


#### 7.2.2.4 Case Study: bc(1) and dc(1)
Part of the classic Unix toolkit dating back to Version 7 is a pair of calculator programs. The dc(1) program is a simple calculator that accepts text lines consisting of reverse-Polish notation (RPN) on standard input and emits calculated answers to standard output. The bc(1) program accepts a more elaborate infix syntax resembling conventional algebraic notation; it includes as well the ability to set and read variables and define functions for elaborate formulas.

While the modern GNU implementation of bc(1) is standalone, the classic version passed commands to dc(1) over a pipe. In this division of labor, bc(1) does variable substitution and function expansion and translates infix notation into reverse-Polish—but doesn’t actually do calculation itself, instead passing RPN translations of input expressions to dc(1) for evaluation.

There are clear advantages to this separation of function. It means that users get to choose their preferred notation, but the logic for arbitrary-precision numeric calculation (which is moderately tricky) does not have to be duplicated. Each of the pair of programs can be less complex than one calculator with a choice of notations would be. The two components can be debugged and mentally modeled independently of each other.

In Chapter 8 we will reexamine these programs from a slightly different example, as examples of domain-specific minilanguages.


#### 7.2.2.5 Anti-Case Study: Why Isn’t fetchmail a Pipeline?
In Unix terms, fetchmail is an uncomfortably large program that bristles with options. Thinking about the way mail transport works, one might think it would be possible to decompose it into a pipeline. Suppose for a moment it were broken up into several programs: a couple of fetch programs to get mail from POP3 and IMAP sites, and a local SMTP injector. The pipeline could pass Unix mailbox format. The present elaborate fetchmail configuration could be replaced by a shellscript containing command lines. One could even insert filters in the pipeline to block spam.

images

This would be very elegant and Unixy. Unfortunately, it can’t work. We touched on the reason earlier; pipelines are unidirectional.

One of the things the fetcher program (imap or pop) would have to do is decide whether to send a delete request for each message it fetches. In fetchmail’s present organization, it can delay sending that request to the POP or IMAP server until it knows that the local SMTP listener has accepted responsibility for the message. The pipelined, small-component version would lose that property.

Consider, for example, what would happen if the smtp injector fails because the SMTP listener reports a disk-full condition. If the fetcher has already deleted the mail, we lose. This means the fetcher cannot delete mail until it is notified to do so by the smtp injector. This in turn raises a host of questions. How would they communicate? What message, exactly, would the injector pass back? The global complexity of the resulting system, and its vulnerability to subtle bugs, would almost certainly be higher than that of a monolithic program.

Pipelines are a marvelous tool, but not a universal one.


#### 7.2.3 Wrappers
The opposite of a shellout is a wrapper. A wrapper creates a new interface for a called program, or specializes it. Often, wrappers are used to hide the details of elaborate shell pipelines. We’ll discuss interface wrappers in Chapter 11. Most specialization wrappers are quite simple, but nevertheless very useful.

As with shellouts, there is no associated protocol because the programs do not communicate during the execution of the callee; but the wrapper usually exists to specify arguments that modify the callee’s behavior.


#### 7.2.3.1 Case Study: Backup Scripts
Specialization wrappers are a classic use of the Unix shell and other scripting languages. One kind of specialization wrapper that is both common and representative is a backup script. It may be a one-liner as simple as this:

tar -czvf /dev/st0 "$@"


This is a wrapper for the tar(1) tape archiver utility which simply supplies one fixed argument (the tape device /dev/st0) and passes to tar all the other arguments supplied by the user (“$@”).7

7 A common error is to use $* rather than “$@”. This does bad things when handed a filename with embedded spaces.


#### 7.2.4 Security Wrappers and Bernstein Chaining
One common use of wrapper scripts is as security wrappers. A security script may call a gatekeeper program to check some sort of credential, then conditionally execute another based on the status value returned by the gatekeeper.

Bernstein chaining is a specialized security-wrapper technique first invented by Daniel J. Bernstein, who has employed it in a number of his packages. (A similar pattern appears in commands like nohup(1) and su(1), but the conditionality is absent.) Conceptually, a Bernstein chain is like a pipeline, but each successive stage replaces the previous one rather than running concurrently with it.

The usual application is to confine security-privileged applications to some sort of gatekeeper program, which can then hand state to a less privileged one. The technique pastes several programs together using execs, or possibly a combination of forks and execs. The programs are all named on one command line. Each program performs some function and (if successful) runs exec(2) on the rest of its command line.

Bernstein’s rblsmtpd package is a prototypical example. It serves to look up a host in the antispam DNS zone of the Mail Abuse Prevention System. It does this by doing a DNS query on the IP address passed into it in the TCPREMOTEIP environment variable. If the query is successful, then rblsmtpd runs its own SMTP that discards the mail. Otherwise the remaining command-line arguments are presumed to constitute a mail transport agent that knows the SMTP protocol, and are handed to exec(2) to be run.

Another example can be found in Bernstein’s qmail package. It contains a program called condredirect. The first parameter is an email address, and the remainder a gatekeeper program and arguments. condredirect forks and execs the gatekeeper with its arguments. If the gatekeeper exits successfully, condredirect forwards the email pending on stdin to the specified email address. In this case, opposite to that of rblsmtpd, the security decision is made by the child; this case is a bit more like a classical shellout.

A more elaborate example is the qmail POP3 server. It consists of three programs, qmail-popup, checkpassword, and qmail-pop3d. Checkpassword comes from a separate package cleverly called checkpassword, and unsurprisingly it checks the password. The POP3 protocol has an authentication phase and mailbox phase; once you enter the mailbox phase you cannot go back to the authentication phase. This is a perfect application for Bernstein chaining.

The first parameter of qmail-popup is the hostname to use in the POP3 prompts. The rest of its parameters are forked and passed to exec(2), after the POP3 username and password have been fetched. If the program returns failure, the password must be wrong, so qmail-popup reports that and waits for a different password. Otherwise, the program is presumed to have finished the POP3 conversation, so qmail-popup exits.

The program named on qmail-popup’s command line is expected to read three null-terminated strings from file descriptor 3.8 These are the username, password, and response to a cryptographic challenge, if any. This time it’s checkpassword which accepts as parameters the name of qmail-pop3d and its parameters. The checkpassword program exits with failure if the password does not match; otherwise it changes to the user’s uid, gid, and home directory, and executes the rest of its command line on behalf of that user.

8 qmail-popup’s standard input and standard output are the socket, and standard error (which will be file descriptor 2) goes to a log file. File descriptor 3 is guaranteed to be the next to be allocated. As an infamous kernel comment once observed: “You are not expected to understand this”.

Bernstein chaining is useful for situations in which the application needs setuid or setgid privileges to initialize a connection, or to acquire some credential, and then drop those privileges so that following code does not have to be trusted. Following the exec, the child program cannot set its real user ID back to root. It’s also more flexible than a single process, because you can modify the behavior of the system by inserting another program into the chain.

For example, rblsmtpd (mentioned above) can be inserted into a Bernstein chain, in between tcpserver (from the ucspi-tcp package) and the real SMTP server, typically qmail-smtpd. However, it works with inetd(8) and sendmail -bs as well.


#### 7.2.5 Slave Processes
Occasionally, child programs both accept data from and return data to their callers through pipes connected to standard input and output, interactively. Unlike simple shellouts and what we have called ’bolt-ons’ above, both master and slave processes need to have internal state machines to handle a protocol between them without deadlocking or racing. This is a drastically more complex and more difficult-to-debug organization than a simple shellout.

Unix’s popen(3) call can set up either an input pipe or an output pipe for a shellout, but not both for a slave process—this seems intended to encourage simpler programming. And, in fact, interactive master-slave communication is tricky enough that it is normally only used when either (a) the implied protocol is utterly trivial, or (b) the slave process has been designed to speak an application protocol along the lines we discussed in Chapter 5. We’ll return to this issue, and ways to cope with it, in Chapter 8.

When writing a master/slave pair, it is good practice for the master to support a command-line switch or environment variable that allows callers to set their own slave command. Among other things, this is useful for debugging; you will often find it handy during development to invoke the real slave process from within a harness that monitors and logs transactions between slave and master.

If you find that master/slave interactions in your program are becoming nontrivial, it may be time to think about going the rest of the way to a more peer-to-peer organization, using techniques like sockets or shared memory.


#### 7.2.5.1 Case Study: scp and ssh
One common case in which the implied protocol really is trivial is progress meters. The scp(1) secure-copy command calls ssh(1) as a slave process, intercepting enough information from ssh’s standard output to reformat the reports as an ASCII animation of a progress bar.9

9 The friend who suggested this case study comments: “Yes, you can get away with this technique...if there are just a few easily-recognizable nuggets of information coming back from the slave process, and you have tongs and a radiation suit”.


#### 7.2.6 Peer-to-Peer Inter-Process Communication
All the communication methods we’ve discussed so far have a sort of implicit hierarchy about them, with one program effectively controlling or driving another and zero or limited feedback passing in the opposite direction. In communications and networking we frequently need channels that are peer-to-peer, usually (but not necessarily) with data flowing freely in both directions. We’ll survey peer-to-peer communications methods under Unix here, and develop some case studies in later chapters.


#### 7.2.6.1 Tempfiles
The use of tempfiles as communications drops between cooperating programs is the oldest IPC technique there is. Despite drawbacks, it’s still useful in shellscripts, and in one-off programs where a more elaborate and coordinated method of communication would be overkill.

The most obvious problem with using tempfiles as an IPC technique is that it tends to leave garbage lying around if processing is interrupted before the tempfile can be deleted. A less obvious risk is that of collisions between multiple instances of a program using the same name for a tempfile. This is why it is conventional for shellscripts that make tempfiles to include $$ in their names; this shell variable expands to the process-ID of the enclosing shell and effectively guarantees that the filename will be unique (the same trick is supported in Perl).

Finally, if an attacker knows the location to which a tempfile will be written, it can overwrite on that name and possibly either read the producer’s data or spoof the consumer process by inserting modified or spurious data into the file.10 This is a security risk. If the processes involved have root privileges, this is a very serious risk. It can be mitigated by setting the permissions on the tempfile directory carefully, but such arrangements are notoriously likely to spring leaks.

10 A particularly nasty variant of this attack is to drop in a named Unix-domain socket where the producer and consumer programs are expecting the tempfile to be.

All these problems aside, tempfiles still have a niche because they’re easy to set up, they’re flexible, and they’re less vulnerable to deadlocks or race conditions than more elaborate methods. And sometimes, nothing else will do. The calling conventions of your child process may require that it be handed a file to operate on. Our first example of a shellout to an editor demonstrates this perfectly.


#### 7.2.6.2 Signals
The simplest and crudest way for two processes on the same machine to communicate with each other is for one to send the other a signal. Unix signals are a form of soft interrupt; each one has a default effect on the receiving process (usually to kill it). A process can declare a signal handler that overrides the default action for the signal; the handler is a function that is executed asynchronously when the signal is received.

Signals were originally designed into Unix as a way for the operating system to notify programs of certain errors and critical events, not as an IPC facility. The SIGHUP signal, for example, is sent to every program started from a given terminal session when that session is terminated. The SIGINT signal is sent to whatever process is currently attached to the keyboard when the user enters the currently-defined interrupt character (often control-C). Nevertheless, signals can be useful for some IPC situations (and the POSIX-standard signal set includes two signals, SIGUSR1 and SIGUSR2, intended for this use). They are often employed as a control channel for daemons (programs that run constantly, invisibly, in background), a way for an operator or another program to tell a daemon that it needs to either reinitialize itself, wake up to do work, or write internal-state/debugging information to a known location.

I insisted SIGUSR1 and SIGUSR2 be invented for BSD. People were grabbing system signals to mean what they needed them to mean for IPC, so that (for example) some programs that segfaulted would not coredump because SIGSEGV had been hijacked.

This is a general principle—people will want to hijack any tools you build, so you have to design them to either be un-hijackable or to be hijacked cleanly. Those are your only choices. Except, of course, for being ignored—a highly reliable way to remain unsullied, but less satisfying than might at first appear.

—Ken Arnold

A technique often used with signal IPC is the so-called pidfile. Programs that will need to be signaled will write a small file to a known location (often in /var/run or the invoking user’s home directory) containing their process ID or PID. Other programs can read that file to discover that PID. The pidfile may also function as an implicit lock file in cases where no more than one instance of the daemon should be running simultaneously.

There are actually two different flavors of signals. In the older implementations (notably V7, System III, and early System V), the handler for a given signal is reset to the default for that signal whenever the handler fires. The result of sending two of the same signal in quick succession is therefore usually to kill the process, no matter what handler was set.

The BSD 4.x  versions of Unix changed to “reliable” signals, which do not reset unless the user explicitly requests it. They also introduced primitives to block or temporarily suspend processing of a given set of signals. Modern Unixes support both styles. You should use the BSD-style nonresetting entry points for new code, but program defensively in case your code is ever ported to an implementation that does not support them.

Receiving N signals does not necessarily invoke the signal handler N times. Under the older System V signal model, two or more signals spaced very closely together (that is, within a single timeslice of the target process) can result in various race conditions11 or anomalies. Depending on what variant of signals semantics the system supports, the second and later instances may be ignored, may cause an unexpected process kill, or may have their delivery delayed until earlier instances have been processed (on modern Unixes the last is most likely).

11 A ’race condition’ is a class of problem in which correct behavior of the system relies on two independent events happening in the right order, but there is no mechanism for ensuring that they actually will. Race conditions produce intermittent, timing-dependent problems that can be devilishly difficult to debug.

The modern signals API is portable across all recent Unix versions, but not to Windows or classic (pre-OS X) MacOS.


#### 7.2.6.3 System Daemons and Conventional Signals
Many well-known system daemons accept SIGHUP (originally the signal sent to programs on a serial-line drop, such as was produced by hanging up a modem connection) as a signal to reinitialize (that is, reload their configuration files); examples include Apache and the Linux implementations of bootpd(8), gated(8), inetd(8), mountd(8), named(8), nfsd(8), and ypbind(8). In a few cases, SIGHUP is accepted in its original sense of a session-shutdown signal (notably in Linux pppd(8)), but that role nowadays generally goes to SIGTERM.

SIGTERM (’terminate’) is often accepted as a graceful-shutdown signal (this is as distinct from SIGKILL, which does an immediate process kill and cannot be blocked or handled). SIGTERM actions often involve cleaning up tempfiles, flushing final updates out to databases, and the like.

When writing daemons, follow the Rule of Least Surprise: use these conventions, and read the manual pages to look for existing models.


#### 7.2.6.4 Case Study: fetchmail’s Use of Signals
The fetchmail utility is normally set up to run as a daemon in background, periodically collecting mail from all remote sites defined in its run-control file and passing the mail to the local SMTP listener on port 25 without user intervention. fetchmail sleeps for a user-defined interval (defaulting to 15 minutes) between collection attempts, so as to avoid constantly loading the network.

When you invoke fetchmail with no arguments, it checks to see if you have a fetchmail daemon already running (it does this by looking for a pidfile). If no daemon is running, fetchmail starts up normally using whatever control information has been specified in its run-control file. If a daemon is running, on the other hand, the new fetchmail instance just signals the old one to wake up and collect mail immediately; then the new instance terminates. In addition, fetchmail -q sends a termination signal to any running fetchmail daemon.

Thus, typing fetchmail means, in effect, “poll now and leave a daemon running to poll later; don’t bother me with the detail of whether a daemon was already running or not”. Observe that the detail of which particular signals are used for wakeup and termination is something the user doesn’t have to know.


#### 7.2.6.5 Sockets
Sockets were developed in the BSD lineage of Unix as a way to encapsulate access to data networks. Two programs communicating over a socket typically see a bidirectional byte stream (there are other socket modes and transmission methods, but they are of only minor importance). The byte stream is both sequenced (that is, even single bytes will be received in the same order sent) and reliable (socket users are guaranteed that the underlying network will do error detection and retry to ensure delivery). Socket descriptors, once obtained, behave essentially like file descriptors.

Sockets differ from read/write in one important case. If the bytes you send arrive, but the receiving machine fails to ACK, the sending machine’s TCP/IP stack will time out. So getting an error does not necessarily mean that the bytes didn’t arrive; the receiver may be using them. This problem has profound consequences for the design of reliable protocols, because you have to be able to work properly when you don’t know what was received in the past. Local I/O is ’yes/no’. Socket I/O is ’yes/no/maybe’. And nothing can ensure delivery—the remote machine might have been destroyed by a comet.

—Ken Arnold

At the time a socket is created, you specify a protocol family which tells the network layer how the name of the socket is interpreted. Sockets are usually thought of in connection with the Internet, as a way of passing data between programs running on different hosts; this is the AF_INET socket family, in which addresses are interpreted as host-address and service-number pairs. However, the AF_UNIX (aka AF_LOCAL) protocol family supports the same socket abstraction for communication between two processes on the same machine (names are interpreted as the locations of special files analogous to bidirectional named pipes). As an example, client programs and servers using the X windowing system typically use AF_LOCAL sockets to communicate.

All modern Unixes support BSD-style  sockets, and as a matter of design they are usually the right thing to use for bidirectional IPC no matter where your cooperating processes are located. Performance pressure may push you to use shared memory or tempfiles or other techniques that make stronger locality assumptions, but under modern conditions it is best to assume that your code will need to be scaled up to distributed operation. More importantly, those locality assumptions may mean that portions of your system get chummier with each others’ internals than ought to be the case in a good design. The separation of address spaces that sockets enforce is a feature, not a bug.

To use sockets gracefully, in the Unix tradition, start by designing an application protocol for use between them—a set of requests and responses which expresses the semantics of what your programs will be communicating about in a succinct way. We’ve already discussed the some major issues in the design of application protocols in Chapter 5.

Sockets are supported in all recent Unixes, under Windows, and under classic MacOS as well.


#### 7.2.6.5.1 Case Study: PostgreSQL
PostgreSQL is an open-source database program. Had it been implemented as a monster monolith, it would be a single program with an interactive interface that manipulates database files on disk directly. Interface would be welded together with implementation, and two instances of the program attempting to manipulate the same database at the same time would have serious contention and locking issues.

Instead, the PostgreSQL suite includes a server called postmaster and at least three client applications. One postmaster server process per machine runs in background and has exclusive access to the database files. It accepts requests in the SQL query minilanguage through TCP/IP sockets, and returns answers in a textual format as well. When the user runs a PostgreSQL client, that client opens a session to postmaster and does SQL transactions with it. The server can handle several client sessions at once, and sequences requests so that they don’t interfere with each other.

Because the front end and back end are separate, the server doesn’t need to know anything except how to interpret SQL requests from a client and send SQL reports back to it. The clients, on the other hand, don’t need to know anything about how the database is stored. Clients can be specialized for different needs and have different user interfaces.

This organization is quite typical for Unix databases—so much so that it is often possible to mix and match SQL clients and SQL servers. The interoperability issues are the SQL server’s TCP/IP port number, and whether client and server support the same dialect of SQL.


#### 7.2.6.5.2 Case Study: Freeciv
In Chapter 6, we introduced Freeciv as an example of transparent data formats. But more critical to the way it supports multiplayer gaming is the client/server partitioning of the code. This is a representative example of a program in which the application needs to be distributed over a wide-area network and handles communication through TCP/IP sockets.

The state of a running Freeciv game is maintained by a server process, the game engine. Players run GUI clients which exchange information and commands with the server through a packet protocol. All game logic is handled in the server. The details of GUI are handled in the client; different clients support different interface styles.

This is a very typical organization for a multiplayer online game. The packet protocol uses TCP/IP as a transport, so one server can handle clients running on different Internet hosts. Other games that are more like real-time simulations (notably first-person shooters) use raw Internet datagram protocol (UDP) and trade lower latency for some uncertainty about whether any given packet will be delivered. In such games, users tend to be issuing control actions continuously, so sporadic dropouts are tolerable, but lag is fatal.


#### 7.2.6.6 Shared Memory
Whereas two processes using sockets to communicate may live on different machines (and, in fact, be separated by an Internet connection spanning half the globe), shared memory requires producers and consumers to be co-resident on the same hardware. But, if your communicating processes can get access to the same physical memory, shared memory will be the fastest way to pass information between them.

Shared memory may be disguised under different APIs, but on modern Unixes the implementation normally depends on the use of mmap(2) to map files into memory that can be shared between processes. POSIX defines a shm_open(3) facility with an API that supports using files as shared memory; this is mostly a hint to the operating system that it need not flush the pseudofile data to disk.

Because access to shared memory is not automatically serialized by a discipline resembling read and write calls, programs doing the sharing must handle contention and deadlock issues themselves, typically by using semaphore variables located in the shared segment. The issues here resemble those in multithreading (see the end of this chapter for discussion) but are more manageable because default is not to share memory. Thus, problems are better contained.

On systems where it is available and reliable, the Apache web server’s scoreboard facility uses shared memory for communication between an Apache master process and the load-sharing pool of Apache images that it manages. Modern X implementations also use shared memory, to pass large images between client and server when they are resident on the same machine, to avoid the overhead of socket communication. Both uses are performance hacks justified by experience and testing, rather than being architectural choices.

The mmap(2) call is supported under all modern Unixes, including Linux and the open-source BSD versions; this is described in the Single Unix Specification. It will not normally be available under Windows, MacOS classic, and other operating systems.

Before purpose-built mmap(2) was available, a common way for two processes to communicate was for them to open the same file, and then delete that file. The file wouldn’t go away until all open filehandles were closed, but some old Unixes took the link count falling to zero as a hint that they could stop updating the on-disk copy of the file. The downside was that your backing store was the file system rather than a swap device, the file system the deleted file lived on couldn’t be unmounted until the programs using it closed, and attaching new processes to an existing shared memory segment faked up in this way was tricky at best.

After Version 7 and the split between the BSD and System V lineages, the evolution of Unix interprocess communication took two different directions. The BSD direction led to sockets. The AT&T lineage, on the other hand, developed named pipes (as previously discussed) and an IPC facility, specifically designed for passing binary data and based on shared-memory bidirectional message queues. This is called ’System V IPC’—or, among old timers, ’Indian Hill’ IPC after the AT&T facility where it was first written.

The upper, message-passing layer of System V IPC has largely fallen out of use. The lower layer, which consists of shared memory and semaphores, still has significant applications under circumstances in which one needs to do mutual-exclusion locking and some global data sharing among processes running on the same machine. These System V shared memory facilities evolved into the POSIX shared-memory API, supported under Linux, the BSDs, MacOS X and Windows, but not classic MacOS.

By using these shared-memory and semaphore facilities (shmget(2), semget(2), and friends) one can avoid the overhead of copying data through the network stack. Large commercial databases (including Oracle, DB2, Sybase, and Informix) use this technique heavily.


### 7.3 Problems and Methods to Avoid
While BSD-style sockets over TCP/IP have become the dominant IPC method under Unix, there are still live controversies over the right way to partition by multiprogramming. Some obsolete methods have not yet completely died, and some techniques of questionable utility have been imported from other operating systems (often in association with graphics or GUI programming). We’ll be touring some dangerous swamps here; beware the crocodiles.


#### 7.3.1 Obsolescent Unix IPC Methods
Unix (born 1969) long predates TCP/IP (born 1980) and the ubiquitous networking of the 1990s and later. Anonymous pipes, redirection, and shellout have been in Unix since very early days, but the history of Unix is littered with the corpses of APIs tied to obsolescent IPC and networking models, beginning with the mx() facility that appeared in Version 6 (1976) and was dropped before Version 7 (1979).

Eventually BSD sockets won out as IPC was unified with networking. But this didn’t happen until after fifteen years of experimentation that left a number of relics behind. It’s useful to know about these because there are likely to be references to them in your Unix documentation that might give the misleading impression that they’re still in use. These obsolete methods are described in more detail in Unix Network Programming [Stevens90].

The real explanation for all the dead IPC facilities in old AT&T Unixes was politics. The Unix Support Group was headed by a low-level manager, while some projects that used Unix were headed by vice presidents. They had ways to make irresistible requests, and would not brook the objection that most IPC mechanisms are interchangeable.

—Doug McIlroy


#### 7.3.1.1 System V IPC
The System V IPC facilities are message-passing facilities based on the System V shared memory facility we described earlier.

Programs that cooperate using System V IPC usually define shared protocols based on exchanging short (up to 8K) binary messages. The relevant manual pages are msgctl(2) and friends. As this style has been largely superseded by text protocols passed between sockets, we do not give an example here.

The System V IPC facilities are present in Linux and other modern Unixes. However, as they are a legacy feature, they are not exercised very often. The Linux version is still known to have bugs as of mid-2003. Nobody seems to care enough to fix them.


#### 7.3.1.2 Streams
Streams networking was invented for Unix Version 8 (1985) by Dennis Ritchie. A re-implementation called STREAMS (yes, it is all-capitals in the documentation) first became available in the 3.0 release of System V Unix (1986). The STREAMS facility provided a full-duplex interface (functionally not unlike a BSD socket, and like sockets, accessible through normal read(2) and write(2) operations after initial setup) between a user process and a specified device driver in the kernel. The device driver might be hardware such as a serial or network card, or it might be a software-only pseudodevice set up to pass data between user processes.

An interesting feature of both streams and STREAMS12 is that it is possible to push protocol-translation modules into the kernel’s processing path, so that the device the user process ’sees’ through the full-duplex channel is actually filtered. This capability could be used, for example, to implement a line-editing protocol for a terminal device. Or one could implement protocols such as IP or TCP without wiring them directly into the kernel.

12 STREAMS was much more complex. Dennis Ritchie is reputed to have said “Streams means something different when shouted”.

Streams originated as an attempt to clean up a messy feature of the kernel called ’line disciplines’—alternative modes of processing character streams coming from serial terminals and early local-area networks. But as serial terminals faded from view, Ethernet LANs became ubiquitous, and TCP/IP drove out other protocol stacks and migrated into Unix kernels, the extra flexibility provided by STREAMS had less and less utility. In 2003, System V Unix still supports STREAMS, as do some System V/BSD hybrids such as Digital Unix and Sun Microsystems’ Solaris.

Linux and other open-source Unixes have effectively discarded STREAMS. Linux kernel modules and libraries are available from the LiS <http://www.gcom.com/home/linux/lis/> project, but (as of mid-2003) are not integrated into the stock Linux kernel. They will not be supported under non-Unix operating systems.


#### 7.3.2 Remote Procedure Calls
Despite occasional exceptions such as NFS (Network File System) and the GNOME project, attempts to import CORBA, ASN.1, and other forms of remote-procedure-call interface have largely failed—these technologies have not been naturalized into the Unix culture.

There seem to be several underlying reasons for this. One is that RPC interfaces are not readily discoverable; that is, it is difficult to query these interfaces for their capabilities, and difficult to monitor them in action without building single-use tools as complex as the programs being monitored (we examined some of the reasons for this in Chapter 6). They have the same version skew problems as libraries, but those problems are harder to track because they’re distributed and not generally obvious at link time.

As a related issue, interfaces that have richer type signatures also tend to be more complex, therefore more brittle. Over time, they tend to succumb to ontology creep as the inventory of types that get passed across interfaces grows steadily larger and the individual types more elaborate. Ontology creep is a problem because structs are more likely to mismatch than strings; if the ontologies of the programs on each side don’t exactly match, it can be very hard to teach them to communicate at all, and fiendishly difficult to resolve bugs. The most successful RPC applications, such as the Network File System, are those in which the application domain naturally has only a few simple data types.

The usual argument for RPC is that it permits “richer” interfaces than methods like text streams—that is, interfaces with a more elaborate and application-specific ontology of data types. But the Rule of Simplicity applies! We observed in Chapter 4 that one of the functions of interfaces is as choke points that prevent the implementation details of modules from leaking into each other. Therefore, the main argument in favor of RPC is also an argument that it increases global complexity rather than minimizing it.

With classical RPC, it’s too easy to do things in a complicated and obscure way instead of keeping them simple. RPC seems to encourage the production of large, baroque, over-engineered systems with obfuscated interfaces, high global complexity, and serious version-skew and reliability problems—a perfect example of thick glue layers run amok.

Windows COM and DCOM are perhaps the archetypal examples of how bad this can get, but there are plenty of others. Apple abandoned OpenDoc, and both CORBA and the once wildly hyped Java RMI have receded from view in the Unix world as people have gained field experience with them. This may well be because these methods don’t actually solve more problems than they cause.

Andrew S. Tanenbaum and Robbert van Renesse have given us a detailed analysis of the general problem in A Critique of the Remote Procedure Call Paradigm [Tanenbaum-VanRenesse], a paper which should serve as a strong cautionary note to anyone considering an architecture based on RPC.

All these problems may predict long-term difficulties for the relatively few Unix projects that use RPC. Of these projects, perhaps the best known is the GNOME desktop effort.13 These problems also contribute to the notorious security vulnerabilities of exposing NFS servers.

13 GNOME’s main competitor, KDE, started with CORBA but abandoned it in their 2.0 release. They have been on a quest for lighter-weight IPC methods ever since.

Unix tradition, on the other hand, strongly favors transparent and discoverable interfaces. This is one of the forces behind the Unix culture’s continuing attachment to IPC through textual protocols. It is often argued that the parsing overhead of textual protocols is a performance problem relative to binary RPCs—but RPC interfaces tend to have latency problems that are far worse, because (a) you can’t readily anticipate how much data marshaling and unmarshaling a given call will involve, and (b) the RPC model tends to encourage programmers to treat network transactions as cost-free. Adding even one additional round trip to a transaction interface tends to add enough network latency to swamp any overhead from parsing or marshaling.

Even if text streams were less efficient than RPC, the performance loss would be marginal and linear, the kind better addressed by upgrading your hardware than by expending development time or adding architectural complexity. Anything you might lose in performance by using text streams, you gain back in the ability to design systems that are simpler—easier to monitor, to model, and to understand.

Today, RPC and the Unix attachment to text streams are converging in an interesting way, through protocols like XML-RPC and SOAP. These, being textual and transparent, are more palatable to Unix programmers than the ugly and heavyweight binary serialization formats they replace. While they don’t solve all the more general problems pointed out by Tanenbaum and van Renesse, they do in some ways combine the advantages of both text-stream and RPC worlds.


#### 7.3.3 Threads—Threat or Menace?
Though Unix developers have long been comfortable with computation by multiple cooperating processes, they do not have a native tradition of using threads (processes that share their entire address spaces). These are a recent import from elsewhere, and the fact that Unix programmers generally dislike them is not merely accident or historical contingency.

From a complexity-control point of view, threads are a bad substitute for lightweight processes with their own address spaces; the idea of threads is native to operating systems with expensive process-spawning and weak IPC facilities.

By definition, though daughter threads of a process typically have separate local-variable stacks, they share the same global memory. The task of managing contentions and critical regions in this shared address space is quite difficult and a fertile source of global complexity and bugs. It can be done, but as the complexity of one’s locking regime rises, the chance of races and deadlocks due to unanticipated interactions rises correspondingly.

Threads are a fertile source of bugs because they can too easily know too much about each others’ internal states. There is no automatic encapsulation, as there would be between processes with separate address spaces that must do explicit IPC to communicate. Thus, threaded programs suffer from not just ordinary contention problems, but from entire new categories of timing-dependent bugs that are excruciatingly difficult to even reproduce, let alone fix.

Thread developers have been waking up to this problem. Recent thread implementations and standards show an increasing concern with providing thread-local storage, which is intended to limit problems arising from the shared global address space. As threading APIs move in this direction, thread programming starts to look more and more like a controlled use of shared memory.

Threads often prevent abstraction. In order to prevent deadlock, you often need to know how and if the library you are using uses threads in order to avoid deadlock problems. Similarly, the use of threads in a library could be affected by the use of threads at the application layer.

—David Korn

To add insult to injury, threading has performance costs that erode its advantages over conventional process partitioning. While threading can get rid of some of the overhead of rapidly switching process contexts, locking shared data structures so threads won’t step on each other can be just as expensive.

The X server, able to execute literally millions of ops/second, is not threaded; it uses a poll/select loop. Various efforts to make a multithreaded implementation have come to no good result. The costs of locking and unlocking get too high for something as performance-sensitive as graphics servers.

—Jim Gettys

This problem is fundamental, and has also been a continuing issue in the design of Unix kernels for symmetric multiprocessing. As your resource-locking gets finer-grained, latency due to locking overhead can increase fast enough to swamp the gains from locking less core memory.

One final difficulty with threads is that threading standards still tend to be weak and underspecified as of mid-2003. Theoretically conforming libraries for Unix standards such as POSIX threads (1003.1c) can nevertheless exhibit alarming differences in behavior across platforms, especially with respect to signals, interactions with other IPC methods, and resource cleanup times. Windows and classic MacOS have native threading models and interrupt facilities quite different from those of Unix and will often require considerable porting effort even for simple threading cases. The upshot is that you cannot count on threaded programs to be portable.

For more discussion and a lucid contrast with event-driven programming, see Why Threads Are a Bad Idea [Ousterhout96].


### 7.4 Process Partitioning at the Design Level
Now that we have all these methods, what should we do with them?

The first thing to notice is that tempfiles, the more interactive sort of master/slave process relationship, sockets, RPC, and all other methods of bidirectional IPC are at some level equivalent—they’re all just ways for programs to exchange data during their lifetimes. Much of what we do in a sophisticated way using sockets or shared memory we could do in a primitive way using tempfiles as mailboxes and signals for notification. The differences are at the edges, in how programs establish communication, where and when one does the marshalling and unmarshalling of messages, in what sorts of buffering problems you may have, and atomicity guarantees you get on the messages (that is, to what extent you can know that the result of a single send action from one side will show up as a single receive event on the other).

We’ve seen from the PostgreSQL study that one effective way to hold down complexity is to break an application into a client/server pair. The PostgreSQL client and server communicate through an application protocol over sockets, but very little about the design pattern would change if they used any other bidirectional IPC method.

This kind of partitioning is particularly effective in situations where multiple instances of the application must manage access to resources that are shared among all. A single server process may manage all resource contention, or cooperating peers may each take responsibility for some critical resource.

Client-server partitioning can also help distribute cycle-hungry applications across multiple hosts. Or it may make them suitable for distributed computing across the Internet (as with Freeciv). We’ll discuss the related CLI server pattern in Chapter 11.

Because all these peer-to-peer IPC techniques are alike at some level, we should evaluate them mainly on the amount of program-complexity overhead they incur, and how much opacity they introduce into our designs. This, ultimately, is why BSD sockets have won over other Unix IPC methods, and why RPC has generally failed to get much traction.

Threads are fundamentally different. Rather than supporting communication among different programs, they support a sort of timesharing within an instance of a single program. Rather than being a way to partition a big program into smaller ones with simpler behavior, threading is strictly a performance hack. It has all the problems normally associated with performance hacks, and a few special ones of its own.

Accordingly, while we should seek ways to break up large programs into simpler cooperating processes, the use of threads within processes should be a last resort rather than a first. Often, you may find you can avoid them. If you can use limited shared memory and semaphores, asynchronous I/O using SIGIO, or poll(2)/select(2) rather than threading, do it that way. Keep it simple; use techniques earlier on this list and lower on the complexity scale in preference to later ones.

The combination of threads, remote-procedure-call interfaces, and heavyweight object-oriented design is especially dangerous. Used sparingly and tastefully, any of these techniques can be valuable—but if you are ever invited onto a project that is supposed to feature all three, fleeing in terror might well be an appropriate reaction.

We have previously observed that programming in the real world is all about managing complexity. Tools to manage complexity are good things. But when the effect of those tools is to proliferate complexity rather than to control it, we would be better off throwing them away and starting from zero. An important part of the Unix wisdom is to never forget this.

## 8. Minilanguages: Finding a Notation That Sings

A good notation has a subtlety and suggestiveness which at times makes it almost seem like a live teacher.

The World of Mathematics (1956)
—Bertrand Russell

One of the most consistent results from large-scale studies of error patterns in software is that programmer error rates in defects per hundreds of lines are largely independent of the language in which the programmers are coding.1 Higher-level languages, which allow you to get more done in fewer lines, mean fewer bugs as well.

1 Les Hatton reports by email on the analysis in his book in preparation, Software Failure: “Provided you use executable line counts for the density measure, the injected defect densities vary less between languages than they do between engineers by about a factor of 10”.

Unix has a long tradition of hosting little languages specialized for a particular application domain, languages that can enable you to drastically reduce the line count of your programs. Domain-specific language examples include the numerous Unix typesetting languages (troff, eqn, tbl, pic, grap), shell utilities (awk, sed, dc, bc), and software development tools (make, yacc, lex). There is a fuzzy boundary between domain-specific languages and the more flexible sort of application run-control file (sendmail, BIND, X); another with data-file formats; and another with scripting languages (which we’ll survey in Chapter 14).

Historically, domain-specific languages of this kind have been called ’little languages’ or ’minilanguages’ in the Unix world, because early examples were small and low in complexity relative to general-purpose languages (all three terms for the category are in common use). But if the application domain is complex (in that it has lots of different primitive operations or involves manipulation of intricate data structures), an application language for it may have to be rather more complex than some general-purpose languages. We’ll keep the traditional term ’minilanguage’ to emphasize that the wise course is usually to keep these designs as small and simple as possible.

The domain-specific little language is an extremely powerful design idea. It allows you to define your own higher-level language to specify the appropriate methods, rules, and algorithms for the task at hand, reducing global complexity relative to a design that uses hardwired lower-level code for the same ends. You can get to a minilanguage design in at least three ways, two of them good and one of them dangerous.

One right way to get there is to realize up front that you can use a minilanguage design to push a given specification of a programming problem up a level, into a notation that is more compact and expressive than you could support in a general-purpose language. As with code generation and data-driven programming, a minilanguage lets you take practical advantage of the fact that the defect rate in your software will be largely independent of the level of the language you are using; more expressive languages mean shorter programs and fewer bugs.

The second right way to get to a minilanguage design is to notice that one of your specification file formats is looking more and more like a minilanguage—that is, it is developing complex structures and implying actions in the application you are controlling. Is it trying to describe control flow as well as data layouts? If so, it may be time to promote that control flow from being implicit to being explicit in your specification language.

The wrong way to get to a minilanguage design is to extend your way to it, one patch and crufty added feature at a time. On this path, your specification file keeps sprouting more implied control flow and more tangled special-purpose structures until it has become an ad-hoc language without your noticing it. Some legendary nightmares have been spawned this way; the example every Unix guru will think of (and shudder over) is the sendmail.cf configuration file associated with the sendmail mail transport.

Sadly, most people do their first minilanguage the wrong way, and only realize later what a mess it is. Then the question is: how to clean it up? Sometimes the answer implies rethinking the entire application design. Another notorious example of language-by-feature creep was the editor TECO, which grew first macros and then loops and conditionals as programmers wanted to use it to package increasingly complex editing routines. The resulting ugliness was eventually fixed by a redesign of the entire editor to be based on an intentional language; this is how Emacs Lisp (which we’ll survey below) evolved.

All sufficiently complicated specification files aspire to the condition of minilanguages. Therefore, it will often be the case that your only defense against designing a bad minilanguage is knowing how to design a good one. This need not be a huge step or involve knowing a lot of formal language theory; with modern tools, learning a few relatively simple techniques and bearing good examples in mind as you design should be sufficient.

In this chapter we’ll examine all the kinds of minilanguages normally supported under Unix, and try to identify the kinds of situation in which each of them represents an effective design solution. This chapter is not meant to be an exhaustive catalog of Unix languages, but rather to bring out the design principles involved in structuring an application around a minilanguage. We’ll have much more to say about languages for general-purpose programming in Chapter 14.

We’ll need to start by doing a little taxonomy, so we’ll know what we’re talking about later on.


### 8.1 Understanding the Taxonomy of Languages
All the languages in Figure 8.1 are described in case studies, either in this chapter or elsewhere in this book. For the general-purpose interpreters near the right-hand side, see Chapter 14.


Figure 8.1. Taxonomy of languages.

image

In Chapter 5 we looked at Unix conventions for data files. There’s a spectrum of complexity in these. At the low end are files that make simple associations between names and properties; the /etc/passwd and .newsrc formats are good examples. Further up the scale we start to get formats that marshal or serialize data structures; the PNG and SNG formats are (equivalent) good examples of this.

A structured data-file format starts to border on being a minilanguage when it expresses not just structure but actions performed on some interpretive context (that is, memory that is outside the data file itself). XML markups tend to straddle this border; the example we’ll look at here is Glade, a code generator for building GUI interfaces. Formats that are both designed to be read and written by humans (rather than just programs) and are used to generate code, are firmly in the realm of minilanguages. yacc and lex are the classic examples. We’ll discuss glade, yacc and lex in Chapter 9.

The Unix macro processor, m4, is another very simple declarative minilanguage (that is, one in which the program is expressed as a set of desired relationships or constraints rather than explicit actions). It has often been used as a preprocessing stage for other minilanguages.

Unix makefiles, which are designed to automate build processes, express dependency relationships between source and derived files2 and the commands required to make each derived file from its sources. When you run make, it uses those declarations to walk the implied tree of dependencies, doing the least work necessary to bring your build up to date. Like yacc and lex specifications, makefiles are a declarative minilanguage; they set up constraints that imply actions performed on an interpretive context (in this case, the portion of the file system where the source and generated files live). We’ll return to makefiles in Chapter 15.

2 For less technical readers: the compiled form of a C program is derived from its C source form by compilation and linkage. The PostScript version of a troff document is derived from the troff source; the command to make the former from the latter is a troff invocation. There are many other kinds of derivation; makefiles can express almost all of them.

XSLT, the language used to describe transformations of XML, is at the high end of complexity for declarative minilanguages. It’s complex enough that it’s not normally thought of as a minilanguage at all, but it shares some important characteristic of such languages which we’ll examine when we look at it in more detail below.

The spectrum of minilanguages ranges from declarative (with implicit actions) to imperative (with explicit actions). The run-control syntax of fetchmail(1) can be viewed as either a very weak imperative language or a declarative language with implied control flow. The troff and PostScript typesetting languages are imperative languages with a lot of special-purpose domain expertise baked into them.

Some task-specific imperative minilanguages start to border on being general-purpose interpreters. They reach this level when they are explicitly Turing-complete—that is, they can do both conditionals and loops (or recursion)3 with features that are designed to be used as control structures. Some languages, by contrast, are only accidentally Turing-complete—they have features that can be used to implement control structures as a sort of side effect of what they are actually designed to do.

3 Any Turing-complete language could theoretically be used for general-purpose programming, and is theoretically exactly as powerful as any other Turing-complete language. In practice, some Turing-complete languages would be far too painful to use for anything outside a specified and narrow problem domain.

The bc(1) and dc(1) interpreters we looked at in Chapter 7 are good examples of specialized imperative minilanguages that are explicitly Turing-complete.

We are over the border into general-purpose interpreters when we reach languages like Emacs Lisp and JavaScript that are designed to be full programming languages run in specialized contexts. We’ll have more to say about these when we discuss embedded scripting languages later on.

The spectrum in interpreters is one of increasing generality; the flip side of this is that a more general-purpose interpreter embodies fewer assumptions about the context in which it runs. With increasing generality there usually comes a richer ontology of data types. Shell and Tcl have relatively simple ontologies; Perl, Python, and Java more complex ones. We’ll return to these general-purpose languages in Chapter 14.


### 8.2 Applying Minilanguages
Designing with minilanguages involves two distinct challenges. One is having existing minilanguages handy in your toolkit, and recognizing when they can be applied as-is. The other is knowing when it is appropriate to design a custom minilanguage for an application. To help you develop both aspects of your design sense, about half of this chapter will consist of case studies.


#### 8.2.1 Case Study: sng
In Chapter 6 we looked at sng(1), which translates between PNG and an editable all-text representation of the same bits. The SNG data-file format is worth reexamining for contrast here because it is not quite a domain-specific minilanguage. It describes a data layout, but doesn’t associate any implied sequence of actions with the data.

SNG does, however, share one important characteristic with domain-specific minilanguages that binary structured data formats like PNG do not—transparency. Structured data files make it possible for editing, conversion, and generation tools to cooperate without knowing about each others’ design assumptions other than through the medium of the minilanguage. What SNG adds is that, like a domain-specific minilanguage, it’s designed to be easy to parse by eyeball and edit with general-purpose tools.


#### 8.2.2 Case Study: Regular Expressions
A kind of specification that turns up repeatedly in Unix tools and scripting languages is the regular expression (’regexp’ for short). We consider it here as a declarative minilanguage for describing text patterns; it is often embedded in other minilanguages. Regexps are so ubiquitous that the are hardly thought of as a minilanguage, but they replace what would otherwise be huge volumes of code implementing different (and incompatible) search capabilities.

This introduction skates over some details like POSIX  extensions, back-references, and internationalization features; for a more complete treatment, see Mastering Regular Expressions [Friedl].

Regular expressions describe patterns that may either match or fail to match against strings. The simplest regular-expression tool is grep(1), a filter that passes through to its output every line in its input matching a specified regexp. Regexp notation is summarized in Table 8.1.

There are a number of minor variants of regexp notation:

Glob expressions. This is the limited set of wildcard conventions used by early Unix shells for filename matching. There are only three wildcards: *, which matches any sequence of characters (like .* in the other variants); ?, which matches any single character (like . in the other variants); and [...], which matches a character class just as in the other variants. Some shells (csh, bash, zsh) later added {} for alternation. Thus, x{a,b}c matches xac or xbc but not xc. Some shells further extend globs in the direction of extended regular expressions.
Basic regular expressions. This is the notation accepted by the original grep(1) utility for extracting lines matching a given regexp from a file. The line editor ed(1), the stream editor sed(1), also use these. Old Unix hands think of these as the basic or ’vanilla’ flavor of regexp; people first exposed to the more modern tools tend to assume the extended form described next.
Extended regular expressions. This is the notation accepted by the extended grep utility egrep(1) for extracting lines matching a given regexp from a file. Regular expressions in Lex and the Emacs editor are very close to the egrep flavor.
Perl regular expressions. This is the notation accepted by Perl and Python regexp functions. These are quite a bit more powerful than the egrep flavor.

Table 8.1. Regular-expression examples.

images

Now that we’ve looked at some motivating examples, Table 8.2 is a summary of the standard regular-expression wildcards. Note: we’re not including the glob variant in this table, so a value of “All” implies only all three of the basic, extended/Emacs, and Perl/Python variants.4

4 The POSIX standard for regular expressions introduces some symbolic ranges like [[:lower;;]] and [[:digit:]], and some specific tools have extra wildcards not covered here, but these will suffice to interpret most regexps.


Table 8.2. Introduction to regular-expression operations.

images

Design practice in new languages with regexp support has stabilized on the Perl/Python variant. It is more transparent than the others, notably because backlash before a non-alphanumeric character always means that character as a literal, so there is much less confusion about how to quote elements of regexps.

Regular expressions are an extreme example of how concise a minilanguage can be. Simple regular expressions express recognition behavior that would otherwise have to be implenented with hundreds of lines of fussy, bug-prone code.


#### 8.2.3 Case Study: Glade
Glade is an interface builder for the open-source GTK toolkit library for X.5 Glade allows you to develop a GUI interface by interactively picking, placing, and modifying widgets on an interface panel. The GUI editor produces an XML file describing the interface; this, in turn, can be fed to one of several code generators that will actually grind out C, C++, Python or Perl code for the interface. The generated code then calls functions you write to supply behavior to the interface.

5 For non-Unix programmers, an X toolkit is a graphics library that supplies GUI widgets (like labels, buttons, and pull-down menus) to the programs that link to it. Under most other graphical operating systems, the OS supplies one toolkit that everyone uses. Unix and X support multiple toolkits; this is part of the separation of policy from mechanism that we called out as a design goal of X in Chapter 1. GTK and Qt are the two most popular open-source X toolkits.

Glade’s XML format for describing GUIs is a good example of a simple domain-specific minilanguage. See Example 8.1 for a “Hello, world!” GUI in Glade format.


Example 8.1. Glade “Hello, World”.

images

A valid specification in Glade format implies a repertoire of actions by the GUI in response to user behavior. The Glade GUI treats these specifications as structured data files; Glade code generators, on the other hand, use them to write programs implementing a GUI. For some languages (including Python), there are runtime libraries that allow you to skip the code-generation step and simply instantiate the GUI directly at runtime from the XML specification (interpreting Glade markup, rather than compiling it to the host language). Thus, you get the choice of trading space efficiency for startup speed or vice versa.

Once you get past the verbosity of XML, Glade markup is a fairly simple language. It does just two things: declare GUI-widget hierarchies and associate properties with widgets. You don’t actually have to know a lot about how glade works to read the specification above. In fact, if you have any experience programming in GUI toolkits, reading it will immediately give you a fairly good visualization of what glade does with the specification. (Hands up everyone who predicted that this particular specification will give you a single button widget in a window frame.)

This kind of transparency and simplicity is the mark of a good minilanguage design. The mapping between the notation and domain objects is very clear. The relationships between objects are expressed directly, rather than through name references or some other sort of indirection that you have to think to follow.

The ultimate functional test of a minilanguage like this one is simple: can I hack it without reading the manual? For a significant range of cases, the Glade answer is yes. For example, if you know the C-level constants that GTK uses to describe window-positioning hints, you’ll recognize GTK_WIN_POS_NONE as one and instantly be able to change the positioning hint associated with this GUI.

The advantage of using Glade should be clear. It specializes in code generation so you don’t have to. That’s one less routine task you have to hand-code, and one fewer source of hand-coded bugs.

More information, including source code and documentation and links to sample applications, is available at the Glade project page <http://glade.gnome.org/>. Glade has been ported to Windows.


#### 8.2.4 Case Study: m4
The m4(1) macro processor interprets a declarative minilanguage for describing transformations of text. An m4 program is a set of macros that specifies ways to expand text strings into other strings. Applying those declarations to an input text with m4 performs macro expansion and yields an output text. (The C preprocessor performs similar services for C compilers, though in a rather different style.)

Example 8.2 shows an m4 macro that directs m4 to expand each occurrence of the string “OS” in its input into the string “operating system” on output. This is a trivial example; m4 supports macros with arguments that can be used to do more than transform one fixed string into another. Typing info m4 at your shell prompt will probably display on-line documentation for this language.


Example 8.2. A sample m4 macro.

image

The m4 macro language supports conditionals and recursion. The combination can be used to implement loops, and this was intended; m4 is deliberately Turing-complete. But actually trying to use m4 as a general-purpose language would be deeply perverse.

The m4 macro processor is usually employed as a preprocessor for minilanguages that lack a built-in notion of named procedures or a built-in file-inclusion feature. It’s an easy way to extend the syntax of the base language so the combination with m4 supports both these features.

One well-known use of m4 has been to clean up (or at least effectively hide) another minilanguage design that was called out as a bad example earlier in this chapter. Most system administrators now generate their sendmail.cf configuration files using an m4 macro package supplied with the sendmail distribution. The macros start from feature names (or name/value pairs) and generate the corresponding (much uglier) strings in the sendmail configuration language.

Use m4 with caution, however. Unix experience has taught minilanguage designers to be wary of macro expansion,6 for reasons we’ll discuss later in the chapter.

6 Whether or not “macro expansion” should be spelled “macroexpansion” is a matter for some dispute. The latter is found mainly among Lisp programmers.


#### 8.2.5 Case Study: XSLT
XSLT, like m4 macros, is a language for describing transformations of a text stream. But it does much more than simple macro substitution; it describes transformations of XML data, including query and report generation. It is the language used to write XML stylesheets. For practical applications, see the description of XML document processing in Chapter 18. XSLT is described by a World Wide Web Consortium standard and has several open-source implementations.

XSLT and m4 macros are both purely declarative and Turing-complete, but XSLT supports only recursions and not loops. It is quite complex, certainly the most difficult language to master of any in this chapter’s case studies—and probably the most difficult of any language mentioned in this book.7

7 It is not clear that XSLT could be any simpler and still do its job, however, so we cannot characterize it as a bad design.

Despite its complexity, XSLT really is a minilanguage. It shares important (though not universal) characteristics of the breed:

• A restricted ontology of types, with (in particular) no analog of record structures or arrays.

• Restricted interface to the rest of the world. XSLT processors are designed to filter standard input to standard output, with a limited ability to read and write files. They can’t open sockets or run subcommands.


Example 8.3. A sample XSLT program.

images

The program in Example 8.3 transforms an XML document so that each attribute of every element is transformed into a new tag pair directly enclosed by that element, with the attribute value as the tag pair’s content.

We’ve included a glance at XSLT here partly to illustrate the point that ’declarative’ does not imply either ’simple’ or ’weak’, and mostly because if you have to work with XML documents, you will someday have to face the challenge that is XSLT.

XSLT: Mastering XML Transformations [Tidwell] is a good introduction to the language. A brief tutorial with examples is available on the Web.8

8 XSL Concepts and Practical Use <http://nwalsh.com/docs/tutorials/xsl/xsl/slides.html>.


#### 8.2.6 Case Study: The Documenter’s Workbench Tools
The troff(1) typesetting formatter was, as we noted in Chapter 2, Unix’s original killer application. troff is the center of a suite of formatting tools (collectively called Documenter’s Workbench or DWB), all of which are domain-specific minilanguages of various kinds. Most are either preprocessors or postprocessors for troff markup. Open-source Unixes host an enhanced implementation of Documenter’s Workbench called groff(1), from the Free Software Foundation.

We’ll examine troff in more detail in Chapter 18; for now, it’s sufficient to note that it is a good example of an imperative minilanguage that borders on being a full-fledged interpreter (it has conditionals and recursion but not loops; it is accidentally Turing-complete).

The postprocessors (’drivers’ in DWB terminology) are normally not visible to troff users. The original troff emitted codes for the particular typesetter the Unix development group had available in 1970; later in the 1970s these were cleaned up into a device-independent minilanguage for placing text and simple graphics on a page. The postprocessors translate this language (called “ditroff” for “device-independent troff”) into something modern imaging printers can actually accept—the most important of these (and the modern default) is PostScript.

The preprocessors are more interesting, because they actually add capabilities to the troff language. There are three common ones: tbl(1) for making tables, eqn(1) for typesetting mathematical equations, and pic(1) for drawing diagrams. Less used, but still live, are grn(1) for graphics, and refer(1) and bib(1) for formatting bibliographies. Open-source equivalents of all of these ship with groff. The grap(1) preprocessor provided a rather versatile plotting facility; there is an open-source implementation separate from groff.

Some other preprocessors have no open-source implementation and are no longer in common use. Best known of these was ideal(1), for graphics. A younger sibling of the family, chem(1), draws chemical structural formulas; it is available as part of Bell Labs’s netlib code.9

9 http://www.netlib.org/

Each of these preprocessors is a little program that accepts a minilanguage and compiles it into troff requests. Each one recognizes the markup it is supposed to interpret by looking for a unique start and end request, and passes through unaltered any markup outside those (tbl looks for .TS/.TE, pic looks for .PS/.PE, etc.). Thus, most of the preprocessors can normally be run in any order without stepping on each other. There are some exceptions: in particular, chem and grap both issue pic commands, and so must come before it in the pipeline.

images

The preceding is a full-Monty example of a Documenter’s Workbench processing pipeline, for a hypothetical thesis incorporating chemical formulas, mathematical equations, tables, bibliographies, plots, and diagrams. (The cat(1) command simply copies its input or a file argument to its output; we use it here to emphasize the order of operations.) In practice modern troff implementations tend to support command-line options that can invoke at least tbl(1), eqn(1) and pic(1), so it isn’t necessary to write such an elaborate pipeline. Even if it were, these sorts of build recipes are normally composed just once and stashed away in a makefile or shellscript wrapper for repeated use.

The document markup of Documenter’s Workbench is in some ways obsolete, but the range of problems these preprocessors address gives some indication of the power of the minilanguage model—it would be extremely difficult to embed equivalent knowledge into a WYSIWYG word processor. There are some ways in which modern XML-based document markups and toolchains are still, in 2003, playing catch-up with capabilities that Documenter’s Workbench had in 1979. We’ll discuss these issues in more detail in Chapter 18.

The design themes that gave Documenter’s Workbench so much power should by now be familiar ones; all the tools share a common text-stream representation of documents, and the formatting system is broken up into independent components that can be debugged and improved separately. The pipeline architecture supports plugging in new, experimental preprocessors and postprocessors without disturbing old ones. It is modular and extensible.

The architecture of Documenter’s Workbench as a whole teaches us some things about how to fit multiple specialist minilanguages into a cooperating system. One preprocessor can build on another. Indeed, the Documenter’s Workbench tools were an early exemplar of the power of pipes, filtering, and minilanguages that influenced a lot of later Unix design by example. The design of the individual preprocessors has more lessons to teach about what effective minilanguage designs look like.

One of these lessons is negative. Sometimes users writing descriptions in the minilanguages do unclean things with low-level troff markup inserted by hand. This can produce interactions and bugs that are hard to diagnose, because the generated troff coming out of the pipeline is not visible—and would not be readable if it were. This is analogous to the sorts of bugs that happen in code that mixes C with snippets of in-line assembler. It might have been better to separate the language layers more completely, if that were possible. Minilanguage designers should take note of this.

All the preprocessor languages (though not troff markup itself) have relatively clean, shell-like syntaxes that follow many of the conventions we described in Chapter 5 for the design of data-file formats. There are a few embarrassing exceptions; notably, tbl(1) defaults to using a tab as a field separator between table columns, replicating an infamous botch in the design of make(1) and causing annoying bugs when editors or other tools invisibly change the composition of whitespace.

While troff itself is a specialized imperative language, one theme that runs through at least three of the Documenter’s Workbench minilanguages is declarative semantics: doing layout from constraints. This is an idea that shows up in modern GUI toolkits as well—that, instead of giving pixel coordinates for graphical objects, what you really want to do is declare spatial relationships among them (“widget A is above widget B, which is to the left of widget C”) and have your software compute a best-fit layout for A, B, and C according to those constraints.

The pic(1) program uses this approach to lay out elements for diagrams. The language taxonomy diagram at Figure 8.1 was produced with the pic source code in Example 8.410 run through pic2graph, one of our case studies in Chapter 7.

10 It is also quite traditional for Unix books that describe pic(1) to include their own illustrations as coding examples.


Example 8.4. Taxonomy of languages—the pic source.

images

images

This is a very typical Unix minilanguage design, and as such has some points of interest even on the purely syntactic level. Notice how much it looks like a shell program: # leads comments, and the syntax is obviously token-oriented with the simplest possible convention for strings. The designer of pic(1) knew that Unix programmers expect minilanguage syntaxes to look like this unless there is a strong and specific reason they should not. The Rule of Least Surprise is in full operation here.

It probably doesn’t take a lot of effort to discern that the first line of code is a macro definition; the later references to smallellipse() encapsulate a repeated design element of the diagram. Nor will it take much scrutiny to deduce that box invis declares a box with invisible borders, actually just a frame for text to be stacked inside. The arrow command is equally obvious.

With these as clues and one eye on the actual diagram, the meaning of the remaining pieces of the syntax (position references like M.s and constructions like last arrow or at 0.25 between M.e and I.e or the addition of vector offsets to a location) should become rapidly apparent. As with Glade markup and m4, an example like this one can teach a good bit of the language without any reference to a manual (a compactness property troff(1) markup, unfortunately, does not have).

The example of pic(1) reflects a common design theme in minilanguages, which we also saw reflected in Glade—the use of a minilanguage interpreter to encapsulate some form of constraint-based reasoning and turn it into actions. We could actually choose to view pic(1) as an imperative language rather than a declarative one; it has elements of both, and the dispute would quickly grow theological.

The combination of macros with constraint-based layout gives pic(1) the ability to express the structure of diagrams in a way that more modern vector-based markups like SVG cannot. It is therefore fortunate that one effect of the Documenter’s Workbench design is to make it relatively easy to keep pic(1) useful outside the DWB context. The pic2graph script we used as a case study in Chapter 7 was an ad-hoc way to accomplish this, using the retrofitted PostScript capability of groff(1) as a half-way step to a modern bitmap format.

A cleaner solution is the pic2plot(1) utility distributed with the GNU plotutils package, which exploited the internal modularity of the GNU pic(1) code. The code was split into a parsing front end and a back end that generated troff markup, the two communicating through a layer of drawing primitives. Because this design obeyed the Rule of Modularity, pic2plot(1) implementers were able to split off the GNU pic parsing stage and reimplement the drawing primitives using a modern plotting library. Their solution has the disadvantage, however, that text in the output is generated with fonts built into pic2plot that won’t match those of troff.


#### 8.2.7 Case Study: fetchmail Run-Control Syntax
See Example 8.5 for an example.


Example 8.5. Synthetic example of a fetchmailrc.

images

This run-control file can be viewed as an imperative minilanguage. There is an implied flow of execution: cycle through the list of poll commands repeatedly (sleeping for a while at the end of each cycle), and for each site entry collect mail for each associated user in sequence. It is far from being general-purpose; all it can do is sequence the program’s polling behavior.

As with pic(1), one could choose to view this minilanguage as either declarations or a very weak imperative language, and argue endlessly over the distinction. On the one hand, it has neither conditionals nor recursion nor loops; in fact, it has no explicit control structures at all. On the other hand, it does describe actions rather than just relationships, which distinguishes it from a purely declarative syntax like Glade GUI descriptions.

Run-control minilanguages for complex programs often straddle this border. We’re making a point of this fact because not having explicit control structures in an imperative minilanguage can be a tremendous simplification if the problem domain lets you get away with it.

One notable feature of .fetchmailrc syntax is the use of optional noise keywords that are supported simply in order to make the specifications read a bit more like English. The ’with’ keywords and single occurrence of ’options’ in the example aren’t actually necessary, but they help make the declarations easier to read at a glance.

The traditional term for this sort of thing is syntactic sugar; the maxim that goes with this is a famous quip that “syntactic sugar causes cancer of the semicolon”.11 Indeed, syntactic sugar needs to be used sparingly lest it obscure more than help.

11 The line is owed to Alan Perlis, who did some of the pioneering work in software modularity around 1970. The semicolon in question was the statement separator or terminator in various Algol-descended languages, including Pascal and C.

In Chapter 9 we’ll see how data-driven programming helps provide an elegant solution to the problem of editing fetchmail run-control files through a GUI.


#### 8.2.8 Case Study: awk
The awk minilanguage is an old-school Unix tool, formerly much used in shellscripts. Like m4, it’s intended for writing small but expressive programs to transform textual input into textual output. Versions ship with all Unixes, several in open source; the command info gawk at your Unix shell prompt is quite likely to take you to on-line documentation.

Programs in awk consist of pattern/action pairs. Each pattern is a regular expression, a concept we’ll describe in detail in Chapter 9. When an awk program is run, it steps through each line of the input file. Each line is checked against every pattern/action pair in order. If the pattern matches the line, the associated action is performed.

Each action is coded in a language resembling a subset of C, with variables and conditionals and loops and an ontology of types including integers, strings, and (unlike C) dictionaries.12

12 For those who have never programmed in a modern scripting language, a dictionary is a lookup table of key-to-value associations, often implemented through a hash table. C programmers spend a lot of their coding time implementing dictionaries in various elaborate ways.

The awk action language is Turing-complete, and can read and write files. In some versions it can open and use network sockets. But awk has primarily seen use as a report generator, especially for interpreting and reducing tabular data. It is seldom used standalone, but rather embedded in scripts. There is an example awk program in the case study on HTML generation included in Chapter 9.

A case study of awk is included to point out that it is not a model for emulation; in fact, since 1990 it has largely fallen out of use. It has been superseded by new-school scripting languages—notably Perl, which was explicitly designed to be an awk killer. The reasons are worthy of examination, because they constitute a bit of a cautionary tale for minilanguage designers.

The awk language was originally designed to be a small, expressive special-purpose language for report generation. Unfortunately, it turns out to have been designed at a bad spot on the complexity-vs.-power curve. The action language is noncompact, but the pattern-driven framework it sits inside keeps it from being generally applicable—that’s the worst of both worlds. And the new-school scripting languages can do anything awk can; their equivalent programs are usually just as readable, if not more so.

Awk has also fallen out of use because more modern shells have floating point arithmetic, associative arrays, RE pattern matching, and substring capabilities, so that equivalents of small awk scripts can be done without the overhead of process creation.

—David Korn

For a few years after the release of Perl in 1987, awk remained competitive simply because it had a smaller, faster implementation. But as the cost of compute cycles and memory dropped, the economic reasons for favoring a special-purpose language that was relatively thrifty with both lost their force. Programmers increasingly chose to do awklike things with Perl or (later) Python, rather than keep two different scripting languages in their heads.13 By the year 2000 awk had become little more than a memory for most old-school Unix hackers, and not a particularly nostalgic one.

13 I was at one time an awk wizard, but I had to be reminded by someone else that the language was applicable to the HTML-generation problem where this book’s only awk example occurs.

Falling costs have changed the tradeoffs in minilanguage design. Restricting your design’s capabilities to buy compactness may still be a good idea, but doing so to economize on machine resources is a bad one. Machine resources get cheaper over time, but space in programmers’ heads only gets more expensive. Modern minilanguages can either be general but noncompact, or specialized but very compact; specialized but noncompact simply won’t compete.


#### 8.2.9 Case Study: PostScript
PostScript is a minilanguage specialized for describing typeset text and graphics to imaging devices. It is an import into Unix, based on design work done at the legendary Xerox Palo Alto Research Center along with the earliest laser printers. For years after its first commercial release in 1984, it was available only as a proprietary product from Adobe, Inc., and was primarily associated with Apple computers. It was cloned under license terms very close to open-source in 1988, and has since become the de-facto standard for printer control under Unix. A fully open-source version is shipped with most most modern Unixes.14 A good technical introduction to PostScript is also available.15

14 There is a GhostScript Project site <http://www.cs.wisc.edu/~ghost/>.

15 A First Guide To PostScript <http://www.cs.indiana.edu/docproject/programming/postscript/postscript.html>.

PostScript bears some functional resemblance to troff markup; both are intended to control printers and other imaging devices, and both are normally generated by programs or macro packages rather than being hand-written by humans. But where troff requests are a jumped-up set of format-control codes with some language features tacked on as an afterthought, PostScript was designed from the ground up as a language and is far more expressive and powerful. The main thing that makes Postscript useful is that algorithmic descriptions of images written in it are far smaller than the bitmaps they render to, and so take up less storage and communication bandwidth.

PostScript is explicitly Turing-complete, supporting conditionals and loops and recursion and named procedures. The ontology of types includes integers, reals, strings, and arrays (each element of an array may be of any type) but no equivalent of structures. Technically, PostScript is a stack-based language; arguments of PostScript’s primitive procedures (operators) are normally popped off a push-down stack of arguments, and the result(s) are pushed back onto it.

There are about 40 basic operators out of a total of around 400. The one that does most of the work is show, which draws a string onto the page. Others set the current font, change the gray level or color, draw lines or arcs or Bezier curves, fill closed regions, set clipping regions, etc. A PostScript interpreter is supposed to be able to interpret these commands into bitmaps to be thrown on a display or print medium.

Other PostScript operators implement arithmetic, control structures, and procedures. These allow repetitive or stereotyped images (such as text, which is composed of repeated letterforms) to be expressed as programs that combine images. Part of the utility of PostScript comes from the fact that PostScript programs to print text or simple vector graphics are much less bulky than the bitmaps the text or vectors render to, are device-resolution independent, and travel more quickly over a network cable or serial line.

Historically, PostScript’s stack-based interpretation resembles a language called FORTH, originally designed to control telescope motors in real time, which was briefly popular in the 1980s. Stack-based languages are famous for supporting extremely tight, economical coding and infamous for being difficult to read. PostScript shares both traits.

PostScript is often implemented as firmware built into a printer. The open-source implementation Ghostscript can translate PostScript to various graphics formats and (weaker) printer-control languages. Most other software treats PostScript as a final output format, meant to be handed to a PostScript-capable imaging device but not edited or eyeballed.

PostScript (either in the original or the trivial variant EPSF, with a bounding box declared around it so it can be embedded in other graphics) is a very well designed example of a special-purpose control language and deserves careful study as a model. It is a component of other standards such as PDF, the Portable Document Format.


#### 8.2.10 Case Study: bc and dc
We first examined bc(1) and dc(1) in Chapter 7 as a case study in shellouts. They are examples of domain-specific minilanguages of the imperative type.

dc is the oldest language on Unix; it was written on the PDP-7 and ported to the PDP-11 before Unix [itself] was ported.

—Ken Thompson

The domain of these two languages is unlimited-precision arithmetic. Other programs can use them to do such calculations without having to worry about the special techniques needed to do those calculations.

In fact, the original motivation for dc had nothing to do with providing a general-purpose interactive calculator, which could have been done with a simple floating-point program. The motivation was Bell Labs’ long interest in numerical analysis: calculating constants for numerical algorithms, accurately is greatly aided by being able to work to much higher precision than the algorithm itself will use. Hence dc’s arbitrary-precision arithmetic.

—Henry Spencer

Like SNG and Glade markup, one of the strengths of both of these languages is their simplicity. Once you know that dc(1) is a reverse-Polish-notation calculator and bc(1) an algebraic-notation calculator, very little about interactive use of either of these languages is going to be novel. We’ll return to the importance of the Rule of Least Surprise in interfaces in Chapter 11.

These minilanguages have both conditionals and loops; they are Turing-complete, but have a very restricted ontology of types including only unlimited-precision integers and strings. This puts them in the borderland between interpreted minilanguages and full scripting languages. The programming features have been designed not to intrude on the common use as a calculator; indeed, most dc/bc users are probably unaware of them.

Normally, dc/bc are used conversationally, but their capacity to support libraries of user-defined procedures gives them an additional kind of utility—programmability. This is actually the most important advantage of imperative minilanguages, one that we observed in the case study of the Documenter’s Workbench tools to be very powerful whether or not a program’s normal mode is conversational; you can use them to write high-level programs that embody task-specific intelligence.

Because the interface of dc/bc is so simple (send a line containing an expression, get back a line containing a value) other programs and scripts can easily get access to all these capabilities by calling these programs as slave processes. Example 8.6 is one famous example, an implementation of the Rivest-Shamir-Adelman public-key cipher in Perl that was widely published in signature blocks and on T-shirts as a protest against U.S. export retrictions on cryptography, c. 1995; it shells out to dc to do the unlimited-precision arithmetic required.


Example 8.6. RSA implementation using dc.

images


#### 8.2.11 Case Study: Emacs Lisp
Rather than merely being run as a slave process to accomplish specific tasks, a special-purpose interpreted language can become the core of an entire architecture; we’ll consider the advantages and disadvantages of this approach in Chapter 13. troff requests were an early example; today, the Emacs editor is one of the best-known and most powerful modern ones. It’s built around a dialect of Lisp with primitives for both describing actions on editing buffers and controlling slave processes.

The fact that Emacs is built around a powerful language for describing editing actions or front ends for other programs means that it can be used for many other things besides ordinary editing. We’ll examine the applications of Emacs’s task-specific intelligence for day-to-day program development (compilation, debugging, version control) in Chapter 15. Emacs ’modes’ are user-defined libraries—programs written in Emacs Lisp that specialize the editor for a particular job—usually, but not necessarily, one related to editing.

Thus there are specialized modes that know the syntax of a large number of programming languages, and of markup languages like SGML, XML, and HTML. But many people also use Emacs modes to send and receive email (these use Unix system mail utilities as slaves) or Usenet news. Emacs can browse the web, or act as a front-end for various chat programs. There is also a calendaring package, Emacs’s own calculator program, and even a fairly wide selection of games written as Emacs Lisp modes (including a descendant of the famous ELIZA program that simulates a Rogersian psychiatrist).16

16 One of the silliest things you can do with a modern Unix machine is run the Eliza mode of Emacs against random quotes from Zippy the Pinhead. M-x psychoanalyze-pinhead; type control-G when you’ve had enough.


#### 8.2.12 Case Study: JavaScript
JavaScript is an open-source language designed to be embedded in C programs. Though it is also embedded in web servers, its original and best-known manifestation is client-side JavaScript, which allows you to embed executable code in Web pages to be run by any JavaScript-capable browser. That is the version we will survey here.

JavaScript is a fully Turing-complete interpreted language with integers, real numbers, booleans, strings, and lightweight dictionary-based objects resembling those of Python. Values are typed, but variables can hold any type; conversions between types are automatic in many contexts. Syntactically JavaScript resembles Java with some influence from Perl, and features Perl-like regular expressions.

Despite all these features, client-side JavaScript is not quite a general-purpose language. Its capabilities are severely restricted to prevent attacks on the browser user through Web pages containing JavaScript code. It can accept input from the user and generate or modify Web pages, but it cannot directly alter the contents of disk files and cannot open its own network connections.

Over time, the JavaScript language has become more general and less bound to its client-side environment. This is something that can be expected to happen to any successful specialized language as its possibilities unfold in the minds of developers and users. Client JavaScript now interacts with its environment by reading and writing values in a single special object called the browser DOM (Document Object Model). The language still has some legacy APIs to the browser that don’t go through the DOM, but these are deprecated, not present in the ECMA-262 standard for JavaScript, and may not be supported in future versions.

The standard reference for JavaScript is JavaScript: The Definitive Guide [FlanaganJavaScript]. Source code is downloadable.17 JavaScript makes an interesting study for two reasons. First, it’s about as close to being a general-purpose language as one can get without actually being there. Second, the binding between client-side JavaScript and its browser environment via a single DOM object is well designed, and could serve as a model for other embedding situations.

17 Open-source JavaScript implementations in C and Java are available <http://www.mozilla.org/js/>.


### 8.3 Designing Minilanguages
When is designing a minilanguage appropriate? We’ve observed that minilanguages offer a way to push problem specifications to a higher level, and seen how this operates in several case studies. The flip side of this observation is that a minilanguage is likely to be a good approach whenever the domain primitives in your application area are simple and stereotyped, but the ways in which users are likely to want to apply them are fluid and varying.

For some related ideas, find a description of the Alternate Hard And Soft Layers <http://www.c2.com/cgi/wiki?AlternateHardAndSoftLayers> and Scripted Components <http://www.doc.ic.ac.uk/~np2/patterns/scripting/scripting.html> design patterns.

An interesting survey of design styles and techniques in minilanguages is  Notable Design Patterns for Domain-Specific Languages [Spinellis].


#### 8.3.1 Choosing the Right Complexity Level
The first important thing to bear in mind when designing a minilanguage is, as usual, to keep it as simple as possible. The taxonomy diagram we used to organize the case studies implies a hierarchy of complexity; you want to keep your design as far toward the left-hand edge as possible. If you can get away with designing a structured data file rather than a minilanguage that is going to modify external data when it’s interpreted, by all means do so.

One very pragmatic reason to stick with structured data rather than a minilanguage is that in a networked world, embedded minilanguage facilities are subject to abuses that can be inconvenient or even dangerous. JavaScript is a prime example in the ’inconvenient’ category; its designers didn’t anticipate that it would be used for pop-up advertisements so obnoxious as to create a demand for browser features that suppress JavaScript interpretation.

Microsoft Word macro viruses show how this sort of thing can become actively dangerous, a security hole that costs billions of dollars in downtime and lost productivity annually. It is instructive to note that despite the existence of at least twenty million Unix users worldwide18 there has never been any Unix equivalent of Windows’s frequent macro-virus outbreaks. There are a number of reasons for this, including the fundamentally better security design of Unix; but at least one is the fact that Unix mail agents do not default to executing live content in any document that the user views.19

18 20M is a conservative estimate based on mid-2003 figures from the Linux Counter and elsewhere.

19 Kmail, which we looked at in Chapter 6, won’t even chase off-site links in HTML for this reason.

If there is any way that your application’s users might end up running programs from untrusted sources, risky features of your application minilanguage might end up having to be suppressed. Languages like Java and JavaScript are explicitly sandboxed—that is, they have limited access to their environment not merely to simplify their design but to try to prevent potentially destructive operations by buggy or malicious code.

On the other hand, a lot of bad designs have been botched by designers who failed to face up to the fact that they really needed a minilanguage rather than a data-file format. Too often, language-like features get pasted on as an afterthought. The two most common symptoms of this problem are weak, ad-hoc control structures and poor or nonexistent facilities for declaring procedures.

It’s risky to design minilanguages that are only accidentally Turing-complete. If you do this the odds are good that, sometime in the future, some clever fellow is going to think he needs to press your language into doing loops and conditionals for him. Because these are only available in an obfuscated way, he’ll produce obfuscated code. The results may be serviceable in the short term, but are likely to be a nightmare for those who come after him.

Minilanguage design is both powerful and esthetically rewarding, but it’s also full of similar traps. There are kinds of design in which it is appropriate to take the bottom-up approach of pasting together a bunch of low-level services and worrying about their organization after you have explored the problem domain for a while. One of the virtues of minilanguages is that they can help you get a good design out of bottom-up programming by allowing you to defer some top-down decisions into the control flow of programs in your minilanguage. But if you take a bottom-up approach to the minilanguage design itself, you are likely to end up with an ugly syntax reflecting a weak language and a poorly-thought-out implementation.

There are many places in a minilanguage design where small choices make a large difference in the useability and ease of the tool:

As a language designer, it is a good principle to consider the alternatives to giving an error message. When there is true ambiguity in the intent of the programmer an error message is appropriate, but in many cases the intent is clear, and making the language silently do the right thing is a great boon. A good example is C accommodating an extra comma at the end of an array initializer list, which makes both editing and machine generation of array initializers much easier. Anti-examples are the pickiness of various HTML readers, especially their habit of silently discarding parts of your document because of trivial nesting errors.

—Steve Johnson

On this issue, as elsewhere, there is no substitute for good taste and engineering judgment. If you’re going to design a minilanguage, don’t do it halfway. Declarative minilanguages should have a clear, consistent language-like syntax designed to be readable by humans. Imperative ones should add a full range of control structures adapted from language models you can expect your users to be familiar with. Think about the language as a language; ask yourself esthetic questions like “Will this be comfortable to program in?” and even “Will it be pleasant to look at?” Here, as elsewhere in software design, David Gelernter’s maxim is apt: beauty is the ultimate defense against complexity.


#### 8.3.2 Extending and Embedding Languages
One fundamentally important question is whether you can implement your minilanguage by extending or embedding an existing scripting language. This is often the right way to go for an imperative minilanguage, but much less appropriate for a declarative one.

Sometimes it’s possible to write your imperative language simply by coding service functions in an interpreted language, which we’ll call the ’host’ language for purposes of this discussion. Your minilanguage programs are then just scripts that load your service library and use the host language’s control structures and other facilities as a framework. Every facility the host language supplies is one you don’t have to write.

This is the easiest way to write a minilanguage. Old-school Lisp programmers (including me) love this technique and use it heavily. It underlies the design of the Emacs editor, and has been rediscovered in the new-school scripting languages like Tcl, Python, and Perl. There are drawbacks to it, however.

Your host language may be unable to interface to a code library that you need. Or, internally, its ontology of data types may be inadequate for the kind of computation you need to do. Or, after measuring the performance of a prototype, you discover that it’s too slow. When any of these things happen, your solution is usually going to involve coding in C (or C++) and integrating the results into your minilanguage.

The option of extending a scripting language with C code, or of embedding a scripting language in a C program, relies on the existence of scripting languages designed for it. You extend a scripting language by telling it to dynamically load a C library or module in such a way that the C entry points become visible as functions in the extended language. You embed a scripting language in a C program by sending commands to an instance of the interpreter and receiving the results back as values in C.

Both techniques also rely on the ability to move data between the type ontology of C and the type ontology of your scripting language. Some scripting languages are designed from the ground up to support this. One such is Tcl, which we’ll cover in Chapter 14. Another is Guile, an open-source dialect of the Lisp variant Scheme. Guile is shipped as a library and specifically designed to be embedded in C programs.

It is possible (though in 2003 still rather painful and difficult) to extend or embed Perl. It is very easy to extend Python and only slightly more difficult to embed it; C extension is especially heavily used in the Python world. Java has an interface to call ’native methods’ in C, though the practice is explicitly discouraged because it tends to break portability. Most versions of shell are not designed for embeddability and extension, but the Korn shell (ksh93 and later versions) is a notable exception.

There are lots of bad reasons not to piggyback your imperative minilanguage on an existing scripting language. One of the few good ones is that you actually want to implement your own custom grammar for error checking. If that’s the case, then see the advice about yacc and lex below.


#### 8.3.3 Writing a Custom Grammar
For declarative minilanguages, one major question is whether or not you should use XML as a base syntax and specify your grammar as an XML document type. This may well be the right thing for elaborately structured declarative minilanguages, but the same caveats we noted in Chapter 5 about the design of data-file formats apply—XML might be overkill. If you don’t use XML, follow the Rule of Least Surprise by supporting the Unix conventions we described for data files (simple token-oriented syntax, supporting C backslash conventions, etc.).

If you do need a custom grammar, yacc and lex (or their local equivalent in the language you’re using) should probably be your best friends, unless the grammar of your language is so simple that hand-coding a recursive-descent parser is trivial. Even then, yacc may give you better error recovery, and a yacc specification will be easier to modify as the language syntax evolves. See Chapter 9 for a look at the yacc- and lex-derived tools available in different implementation languages.

Even if you decide you must implement your own syntax, consider what mileage you can get from reusing existing tools. If you need a macro facility, consider whether preprocessing with m4(1) might be the right answer—but consider the cautions in the next section first.


#### 8.3.4 Macros—Beware!
Macro expansion facilities were a favored tactic for language designers in early Unix; the C language has one, of course, and we have seen them show up in some of the more complex special-purpose minilanguages like pic(1). The m4 preprocessor provides a generic tool for implementing macro-expanding preprocessors.

Macro expansion is easy to specify and implement, and you can do a lot of cute tricks with it. Those early designers appear to have been influenced by experience with assemblers, in which macro facilities were often the only device available for structuring programs.

The strength of macro expansion is that it knows nothing about the underlying syntax of the base language, and can be used to extend that syntax. Unfortunately, this power is very easily abused to produce code that is opaque, surprising, and a fertile source of hard-to-characterize bugs.

In C, the classic example of this sort of problem is a macro such as this:

#define max(x, y)        x > y ? x : y


There are at least two problems with this macro. One is that it can produce surprising results if either of the arguments is an expression including an operator of lower precedence than > or ?:. Consider the expression max(a = b, ++c). If the programmer has forgotten that max is a macro, he will be expecting the assignment a = b and the preincrement operation on c to be executed before the resulting values are passed as arguments to max.

But that’s not what will happen. Instead, the preprocessor will expand this expression to a = b > ++c ? a = b : ++c, which the C compiler’s precedence rules make it interpret as a = (b > ++c ? a = b : ++c). The effect will be to assign to a!

This sort of bad interaction can be headed off by coding the macro definition more defensively.

#define max(x, y)        ((x) > (y) ? (x) : (y))


With this definition, the expansion would be ((a = b) > (++c) ? (a = b) : (++c)). This solves one problem—but notice that c may be incremented twice! There are subtler versions of this trap, such as passing the macro a function-call with side effects.

In general, interactions between macros and expressions with side effects can lead to unfortunate results that are hard to diagnose. C’s macro processor is a deliberately lightweight and simple one; more powerful ones can actually get you in worse trouble.

The TEX formatting language (see Chapter 18) well illustrates the general problem. TEX is intentionally Turing-complete (it has conditionals, loops, and recursion), but while it can be made to do amazing things, TEX code tends to be unreadable and painful to debug. The sources for LATEX, the the most widely used TEX macro package, are an instructive example: they’re in very good TEX style, but even so are extremely difficult to follow.

A minor problem, compared to this one, is that macro expansion tends to screw up error diagnostics. The base language processor generates its error reports relative to the macro expanded text, not the original the programmer is looking at. If the relationship between the two has been obfuscated by macro expansion, the emitted diagnostic can be very difficult to associate with the actual location of the error.

This is especially a problem with preprocessors and macros that can have multiline expansions, conditionally include or exclude text, or otherwise change line numbers in the expanded text.

Macro expansion stages that are built into a language can do their own compensation, fiddling line numbers to refer back to the preexpanded text. The macro facility in pic(1) does this, for example. This problem is more difficult to solve when the macro expansion is done by a preprocessor.

The C preprocessor addresses this problem by emitting #line directives whenever it does an inclusion or multiline expansion. The C compiler is expected to interpret these and adjust the line numbers in its error reports accordingly. Unfortunately, m4 has no such facility.

These are reasons to use macro expansion with extreme caution. One of the long-term lessons of the Unix experience is that macros tend to create more problems than they solve. Modern language and minilanguage designs have moved away from them.


#### 8.3.5 Language or Application Protocol?
Another important question you need to ask is whether your minilanguage engine will be called interactively by other programs, as a slave process. If so, your design should probably look less like a conversational language for human interaction and more like the kind of application protocols we looked at in Chapter 5.

The main difference is how carefully marked the boundaries of transactions are. Human beings are good at spotting where conversational output from a CLI ends, and where the prompt for the next input is. They can use context to tell what’s significant and what should be ignored. Computer programs have much more trouble with this. Without either unambiguous end markers on output or advance knowledge of the length of the output, they can’t tell when to stop reading.

Even worse is when a program’s input is buffered (often inadvertently, as by stdio). A program that stops overtly reading at the right place can nonetheless eat past it.

—Doug McIlroy

Programs in which master processes are trying to do interactive things with slaved minilanguages that are not carefully designed around this problem are prone to deadlock as the master and slave fall out of synchronization (a problem we first noted in Chapter 7).

There are workarounds for driving minilanguages that are not so carefully designed. The prototype for most of them is the Tcl expect package. This package assists conversation with CLIs. It’s built around the following operation: read from slave until either a given regular-expression pattern is matched or a specified timeout elapses. With this (and, of course, a send-to-slave operation) it’s often possible to construct master programs to do reliable dialogues with slave processes even when the latter have not been tailored for the role.

Workalikes of the expect package in other languages are available; a Web search for the name of your favorite language with the added keywords “Tcl expect” is quite likely to turn up something useful. As a minilanguage designer, however, you would be unwise to assume that all your users will be expect gurus. Even if they are, this is an extra glue layer and a place for things to go wrong.

Be aware of this issue when designing your minilanguage. It may be a good idea to add an option that changes its conversational behavior to make it respond more like an application protocol, with unambiguous end-of-output delimiters and an analog of byte stuffing.

## 9. Generation: Pushing the Specification Level Upwards

The programmer at wit’s end ... can often do best by disentangling himself from his code, rearing back, and contemplating his data. Representation is the essence of programming.

The Mythical Man-Month, Anniversary Edition (1975–1995), p. 103
—Fred Brooks

In Chapter 1 we observed that human beings are better at visualizing data than they are at reasoning about control flow. We recapitulate: To see this, compare the expressiveness and explanatory power of a diagram of a fifty-node pointer tree with a flowchart of a fifty-line program. Or (better) of an array initializer expressing a conversion table with an equivalent switch statement. The difference in transparency and clarity is dramatic.1

1 For further development of this point see [Bentley].

Data is more tractable than program logic. That’s true whether the data is an ordinary table, a declarative markup language, a templating system, or a set of macros that will expand to program logic. It’s good practice to move as much of the complexity in your design as possible away from procedural code and into data, and good practice to pick data representations that are convenient for humans to maintain and manipulate. Translating those representations into forms that are convenient for machines to process is another job for machines, not for humans.

Another important advantage of higher-level, more declarative notations is that they lend themselves better to compile-time checking. Procedural notations inherently have complex runtime behavior which is difficult to analyze at compile time. Declarative notations give the implementation much more leverage for finding mistakes, by permitting much more thorough understanding of the intended behavior.

—Henry Spencer

These insights ground in theory a set of practices that have always been an important part of the Unix programmer’s toolkit—very high-level languages, data-driven programming, code generators, and domain-specific minilanguages. What unifies these is that they are all ways of lifting the generation of code up some levels, so that specifications can be smaller. We’ve previously noted that defect densities tend to be nearly constant across programming languages; all these practices mean that whatever malign forces generate our bugs will get fewer lines to wreak their havoc on.

In Chapter 8 we discussed the uses of domain-specific minilanguages. In Chapter 14 we’ll make the argument for very-high-level languages. In this chapter we’ll look at some design studies in data-driven programming and a few examples of ad-hoc code generation; we’ll look at some code-generation tools in Chapter 15. As with minilanguages, these methods can enable you to drastically cut the line count of your programs, and correspondingly lower debugging time and maintenance costs.


### 9.1 Data-Driven Programming
When doing data-driven programming, one clearly distinguishes code from the data structures on which it acts, and designs both so that one can make changes to the logic of the program by editing not the code but the data structure.

Data-driven programming is sometimes confused with object orientation, another style in which data organization is supposed to be central. There are at least two differences. One is that in data-driven programming, the data is not merely the state of some object, but actually defines the control flow of the program. Where the primary concern in OO is encapsulation, the primary concern in data-driven programming is writing as little fixed code as possible. Unix has a stronger tradition of data-driven programming than of OO.

Programming data-driven style is also sometimes confused with writing state machines. It is in fact possible to express the logic of a state machine as a table or data structure, but hand-coded state machines are usually rigid blocks of code that are far harder to modify than a table.

An important rule when doing any kind of code generation or data-driven programming is this: always push problems upstream. Don’t hack the generated code or any intermediate representations by hand—instead, think of a way to improve or replace your translation tool. Otherwise you’re likely to find that hand-patching bits which should have been generated correctly by machine will have turned into an infinite time sink.

At the upper end of its complexity scale, data-driven programming merges into writing interpreters for p-code or simple minilanguages of the kind we surveyed in Chapter 8. At other edges, it merges into code generation and state-machine programming. The distinctions are not actually that important; the important part is moving program logic away from hardwired control structures and into data.


#### 9.1.1 Case Study: ascii
I maintain a program called ascii, a very simple little utility that tries to interpret its command-line arguments as names of ASCII (American Standard Code for Information Interchange) characters and report all the equivalent names. Code and documentation for the tool are available from the project page <http://www.catb.org/~esr/ascii>. Here is an illustrative screenshot:

images

One indication that this program was a good idea is the fact that it has an unexpected use—as a quick CLI aid to converting between decimal, hex, octal, and binary representations of bytes.

The main logic of this program could have been coded as a 128-branch case statement. This would, however, have made the code bulky and difficult to maintain. It would also have tangled parts that change relatively rapidly (like the list of slang names for characters) with parts that change slowly or not at all (like the official names), putting them both in the same legend string and making errors during editing much more likely to touch data that ought to be stable.

Instead, we apply data-driven programming. All the character name strings live in a table structure that is quite a bit larger than any of the functions in the code (indeed, counted in lines it is larger than any three of the functions in the program). The code merely navigates the table and does low-level tasks like radix conversions. The initializer actually lives in the file nametable.h, which is generated in a way we’ll describe later in this chapter.

This organization makes it easy to add new character names, change existing ones, or delete old names by simply editing the table, without disturbing the code.

(The way the program is built is good Unix style, but the output format is questionable. It’s hard to see how the output could usefully become the input of any other program, so it does not play well with others.)


#### 9.1.2 Case Study: Statistical Spam Filtering
One interesting case of data-driven programming is statistical learning algorithms for detecting spam (unsolicited bulk email). A whole class of mail filter programs (those easily findable by Web search include popfile, spambayes, and bogofilter) use a database of word correlations to replace the elaborate pattern-matching conditional logic of pattern-matching spam filters.

Programs like these became common on the Internet very rapidly following Paul Graham’s landmark paper A Plan for Spam [Graham] in 2002. While the explosion was triggered by the increasing cost of the pattern-matching arms race, the statistical-filtering idea was adopted first and fastest by Unix shops. In part, this was certainly because almost all the Internet service providers (who are most burdened by spam, and thus had most incentive to adopt effective new techniques) are Unix shops—but undoubtedly the harmony with some traditional themes in Unix software design helped as well.

Conventional spam filters require that a system administrator, or some other responsible party, maintain information on patterns of text found in spam—names of sites that emit nothing but spam, come-on phrases often used by pornography sites or Internet scam artists, and the like. In his paper, Graham noted accurately that computer programmers like the idea of pattern-matching filters, and sometimes have difficulty seeing past that approach, because it offers them so many opportunities to be clever.

Statistical spam filters, on the other hand, work by collecting feedback about what the user judges to be spam versus nonspam. That feedback is processed into databases of statistical correlation coefficients or weights connecting words or phrases to the user’s spam/nonspam classification. The most popular algorithms use minor variants of Bayes’s Theorem on conditional probabilities, but other techniques (including various sorts of polynomial hashing) are also employed.

In all these programs, the correlation check is a relatively trivial mathematical formula. The weights fed into the formula along with the message being checked serve as implicit control structure for the filtering algorithm.

The problem with conventional pattern-matching spam filters is that they are brittle. Spammers are constantly gaming against the filter-rule databases, forcing the filter maintainers to constantly reprogram their filters to stay ahead in the arms race. Statistical spam filters generate their own filter rules from the user feedback.

In fact, experience with statistical filters seems to show that the particular learning algorithm used is far less important than the quality of the spam and nonspam data sets from which the learning algorithm computes its weights. So the results of statistical filters really are driven more by the shape of the data than by the algorithm.

A Plan for Spam was something of a bombshell because its author argued convincingly that a simple, even crude, statistical approach gave a lower rate of nonspam being erroneously classified as spam than either elaborate pattern-matching techniques or the human eyeball could manage. For Unix programmers, seeing past the lure of clever pattern-matching was far easier than in other programming cultures without as strong an attachment to “Keep It Simple, Stupid!”


#### 9.1.3 Case Study: Metaclass Hacking in fetchmailconf
The fetchmailconf(1) dotfile configurator shipped with fetchmail(1) contains an instructive example of advanced data-driven programming in a very high-level, object-oriented  language.

In October 1997 a series of questions on the fetchmail-friends mailing list made it clear that end-users were having increasing troubles generating configuration files for fetchmail. The file uses a simple, classically-Unixy free-format syntax, but can become forbiddingly complicated when a user has POP3 and IMAP accounts at multiple sites. See Example 9.1 for a somewhat simplified version of the fetchmail author’s configuration file.


Example 9.1. Example of fetchmailrc syntax.

images

The design objective of fetchmailconf was to completely hide the control file syntax behind a fashionable, ergonomically-correct GUI replete with selection buttons, slider bars and fill-out forms. But the beta design had a problem: it could easily generate configuration files from the user’s GUI actions, but could not read and edit existing ones.

The parser for fetchmail’s configuration file syntax is rather elaborate. It’s actually written in yacc and lex, the two classic Unix tools for generating language-parsing code in C. For fetchmailconf to be able to edit existing configuration files, it at first appeared that it would be necessary to replicate that elaborate parser in fetchmailconf’s implementation language—Python.

This tactic seemed doomed. Even leaving aside the amount of duplicative work implied, it is notoriously hard to be certain that two parsers in two different languages accept the same grammar. Keeping them synchronized as the configuration language evolved bid fair to be a maintenance nightmare. It would have violated the SPOT rule we discussed in Chapter 4 wholesale.

This problem stumped me for a while. The insight that cracked it was that fetchmailconf could use fetchmail’s own parser as a filter! I added a --configdump option to fetchmail that would parse .fetchmailrc and dump the result to standard output in the format of a Python initializer. For the file above, the result would look roughly like Example 9.2 (to save space, some data not relevant to the example is omitted).


Example 9.2. Python structure dump of a fetchmail configuration.

images

images

The major hurdle had been leapt. The Python interpreter could then evaluate the fetchmail --configdump output and read the configuration available to fetchmailconf as the value of the variable ’fetchmail’.

But this wasn’t quite the last obstacle in the race. What was really needed wasn’t just for fetchmailconf to have the existing configuration, but to turn it into a linked tree of live objects. There would be three kinds of objects in this tree: Configuration (the top-level object representing the entire configuration), Site (representing one of the servers to be polled), and User (representing user data attached to a site). The example file describes three site objects, each with one user object attached to it.

The three object classes already existed in fetchmailconf. Each had a method that caused it to pop up a GUI edit panel to modify its instance data. The last remaining problem was to somehow transform the static data in this Python initializer into live objects.

I considered writing a glue layer that would explicitly know about the structure of all three classes and use that knowledge to grovel through the initializer creating matching objects, but rejected that idea because new class members were likely to be added over time as the configuration language grew new features. If the object-creation code were written in the obvious way, it would once again be fragile and tend to fall out of synchronization when either the class definitions or the initializer structure dumped by the --configdump report generator changed. Again, a recipe for endless bugs.

The better way would be data-driven programming—code that would analyze the shape and members of the initializer, query the class definitions themselves about their members, and then impedance-match the two sets.

Lisp and Java programmers call this introspection; in some other object-oriented languages it’s called metaclass hacking and is generally considered fearsomely esoteric, deep black magic. Most object-oriented languages don’t support it at all; in those that do (Perl and Java among them), it tends to be a complicated and fragile undertaking. But Python’s facilities for introspection and metaclass hacking are unusually accessible.

See Example 9.3 for the solution code, from near line 1895 of the 1.43 version.


Example 9.3. copy_instance metaclass code.

images

Most of this code is error-checking against the possibility that the class members and --configdump report generation have drifted out of synchronization. It ensures that if the code breaks, the breakage will be detected early—an implementation of the Rule of Repair. The heart of this function is the last two lines, which set attributes in the class from corresponding members in the dictionary. They’re equivalent to this:

images

When your code is this simple, it is far more likely to be right. See Example 9.4 for the code that calls it.


Example 9.4. Calling context for copy_instance.

images

The key point to extract from this code is that it traverses the three levels of the initializer (configuration/server/user), instantiating the correct objects at each level into lists contained in the next object up. Because copy_instance is data-driven and completely generic, it can be used on all three levels for three different object types.

This is a new-school sort of example; Python was not even invented until 1990. But it reflects themes that go back to 1969 in the Unix tradition. If meditating on Unix programming as practiced by his predecessors had not taught me constructive laziness—insisting on reuse, and refusing to write duplicative glue code in accordance with the SPOT rule—I might have rushed into coding a parser in Python. The first key insight that fetchmail itself could be made into fetchmailconf’s configuration parser might never have happened.

The second insight (that copy_instance could be generic) proceeded from the Unix tradition of looking assiduously for ways to avoid hand-hacking. But more specifically, Unix programmers are very used to writing parser specifications to generate parsers for processing language-like markups; from there it was a short step to believing that the rest of the job could be done by some kind of generic tree-walk of the configuration structure. Two separate stages of data-driven programming, one building on the other, were needed to solve the design problem cleanly.

Insights like this can be extraordinarily powerful. The code we have been looking at was written in about ninety minutes, worked the first time it was run, and has been stable in the years since (the only time it has ever broken is when it threw an exception in the presence of genuine version skew). It’s less than forty lines and beautifully simple. There is no way that the naïve approach of building an entire second parser could possibly have produced this kind of maintainability, reliability or compactness. Reuse, simplification, generalization, orthogonality: this is the  Zen of Unix in action.

In Chapter 10, we’ll examine the run-control syntax of fetchmail as an example of the standard shell-like metaformat for run-control files. In Chapter 14 we’ll use fetchmailconf as an example of Python’s strength in rapidly building GUIs.


### 9.2 Ad-hoc Code Generation
Unix comes equipped with some powerful special-purpose code generators for purposes like building lexical analyzers (tokenizers) and parsers; we’ll survey these in Chapter 15. But there are much simpler, lighter-weight sorts of code generation we can use to make life easier without having to know any compiler theory or write (error-prone) procedural logic.

Here are a couple of simple case studies to illustrate this point:


#### 9.2.1 Case Study: Generating Code for the ascii Displays
Called without arguments, ascii generates a usage screen that looks like Example 9.5.


Example 9.5. ascii usage screen.

images

This screen is carefully designed to fit in 23 rows and 79 columns, so that it will fit in a 24×80 terminal window.

This table could be generated at runtime, on the fly. Grinding out the decimal and hex columns would be easy enough. But between wrapping the table at the right places and knowing when to print mnemonics like NUL rather than characters, there would have been enough odd corner cases to make the code distinctly unpleasant. Furthermore, the columns had to be unevenly spaced to make the table fit in 79 columns. But any Unix programmer would reflexively express it as a block of data before finding out these things.

The most naïve way to generate the usage screen would have been to put each line into a C initializer in the ascii.c source code, and then have all lines be written out by code that steps through the initializer. The problem with this method is that the extra data in the C initializer format (trailing newline, string quotes, comma) would make the lines longer than 79 characters, causing them to wrap and making it rather difficult to map the appearance of the code to the appearance of the output. This, in turn, would make the display difficult to edit, which was annoying when I was tinkering it to fit in 24×80 screen cells.

A more sophisticated method using the string-pasting behavior of the ANSI C preprocessor collided with a variant of the same problem. Essentially, any way of inlining the usage screen explicitly would involve punctuation at start and end of line that there’s no room for.2 And copying the table to the screen from a file at runtime seemed like a fragile expedient; after all, the file could get lost.

2 Scripting languages tend to solve this problem more elegantly than C does. Investigate the shell’s here documents and Python’s triple-quote construct to find out how.

Here’s the solution. The source distribution contains a file that just contains the usage screen, exactly as listed above and named splashscreen. The C source contains the following function:

images

And splashscreen.h is generated by a makefile production:

images

So when the program is built, the splashscreen file is automatically massaged into a series of output function calls, which are then included by the C preprocessor in the right function.

By generating the code from data, we get to keep the editable version of the usage screen identical to its display appearance. This promotes transparency. Furthermore, we could modify the usage screen at will without touching the C code at all, and the right thing would automatically happen on the next build.

For similar reasons, the initializer that holds the name synonym strings is also generated via a sed script in the makefile, from a file called nametable in the ascii source distribution. Most of nametable is simply copied into the C initializer. But the generation process would make it easy to adapt this tool for other 8-bit character sets such as the ISO-8859 series (Latin-1 and friends).

This is an almost trivial example, but it nevertheless illustrates the advantages of even simple and ad-hoc code generation. Similar techniques could be applied to larger programs with correspondingly greater benefits.


#### 9.2.2 Case Study: Generating HTML Code for a Tabular List
Let’s suppose that we want to put a page of tabular data on a Web page. We want the first few lines to look like Example 9.6.


Example 9.6. Desired output format for the star table.

images

The thick-as-a-plank way to handle this would be to hand-write HTML table code for the desired appearance. Then, each time we want to add a name, we’d have to hand-write another set of <tr> and <td> tags for the entry. This would get very tedious very quickly. But what’s worse, changing the format of the list would require hand-hacking every entry.

The superficially clever way to handle this would be to make this data a three-column relation in a database, then use some fancy CGI3 technique or a database-capable templating engine like PHP to generate the page on the fly. But suppose we know that the list will not change very often, don’t want to run a database server just to be able to display this list, and don’t want to load the server with unnecessary CGI traffic?

3 Here, CGI refers not to Computer Graphic Inagery but to the Common Gateway Interface used for live Web content.

There’s a better solution. We put the data in a tabular flat-file format like Example 9.7.


Example 9.7. Master form of the star table.

images

We could in a pinch have done without the explicit colon field delimiters, using the pattern consisting of two or more spaces as a delimiter, but the explicit delimiter protects us in case we press spacebar twice while editing a field value and fail to notice it.

We then write a script in shell, Perl, Python, or Tcl that massages this file into an HTML table, and run that each time we add an entry. The old-school Unix way would revolve around the following nigh-unreadable sed(1) invocation

sed -e 's,^,<tr><td>,' -e 's,$,</td></tr>,' -e 's,:,</td><td>,g'


or this perhaps slightly more scrutable awk(1) program:

awk -F: '{printf("<tr><td>%s</td><td>%s</td><td>%s</td></tr>\n", \
                 $1, $2, $3)}'


(If either of these examples interests but mystifies, read the documentation for sed(1) or awk(1). We explained in Chapter 8 that the latter has largely fallen out of use. The former is still an important Unix tool that we haven’t examined in detail because (a) Unix programmers already know it, and (b) it’s easy for non-Unix programmers to pick up from the manual page once they grasp the basic ideas about pipelines and redirection.)

A new-school solution might center on this Python code, or on equivalent Perl:

for row in map(lambda x:x.rstrip().split(':'),sys.stdin.readlines()):
    print "<tr><td>" + "</td><td>".join(row) + "</td></tr>"


These scripts took about five minutes each to write and debug, certainly less time than would have been required to either hand-hack the initial HTML or create and verify the database. The combination of the table and this code will be much simpler to maintain than either the under-engineered hand-hacked HTML or the over-engineered database.

A further advantage of this way of solving the problem is that the master file stays easy to search and modify with an ordinary text editor. Another is that we can experiment with different table-to-HTML transformations by tweaking the generator script, or easily make a subset of the report by putting a grep(1) filter before it.

I actually use this technique to maintain the Web page that lists fetchmail test sites; the example above is science-fictional only because publishing the real data would reveal account usernames and passwords.

This was a somewhat less trivial example than the previous one. What we’ve actually designed here is a separation between content and formatting, with the generator script acting as a stylesheet. (This is yet another mechanism-vs.-policy separation.)

The lesson in all these cases is the same. Do as little work as possible. Let the data shape the code. Lean on your tools. Separate mechanism from policy. Expert Unix programmers learn to see possibilities like these quickly and automatically. Constructive laziness is one of the cardinal virtues of the master programmer.

## 10. Configuration: Starting on the Right Foot

Let us watch well our beginnings, and results will manage themselves.

—Alexander Clark

Under Unix, programs can communicate with their environment in a rich variety of ways. It’s convenient to divide these into (a) startup-environment queries and (b) interactive channels. In this chapter, we’ll focus primarily on startup-environment queries. The next chapter will discuss interactive channels.


### 10.1 What Should Be Configurable?
Before plunging into the details of different kinds of program configuration, we should ask a high-level question: What things should be configurable?

The gut-level Unix answer is “everything”. The Rule of Separation that we discussed in Chapter 1 encourages Unix programmers to build mechanism and defer policy decisions outward toward the user wherever possible. While this tends to produce programs that are powerful and rewarding for expert users, it also tends to produce interfaces that overwhelm novices and casual users with a surfeit of choices, and with configuration files sprouting like weeds.

Unix programmers aren’t going to be cured of their tendency to design for their peers and the most sophisticated users any time soon (we’ll grapple a bit with the question of whether such a change would actually be desirable in Chapter 20). So it’s perhaps more useful to invert the question and ask “What things should not be configurable?” Unix practice does offer some guidelines on this.

First, don’t provide configuration switches for what you can reliably detect automatically. This is a surprisingly common mistake. Instead, look for ways to eliminate configuration switches by autodetection, or by trying alternative methods at runtime until one succeeds. If this strikes you as inelegant or too expensive, ask yourself if you haven’t fallen into premature optimization.

One of the nicest examples of autodetection I experienced was when Dennis Ritchie and I were porting Unix to the Interdata 8/32. This was a big-endian machine, and we had to generate data for that machine on a PDP-11, write a magnetic tape, and then load the magnetic tape on the Interdata. A common error was to forget to twiddle the byte order; a checksum error showed you that you had to unmount, remount again on the PDP-11, regenerate the tape, unmount, and remount. Then one day Dennis hacked the Interdata tape reader program so that if it got a checksum error it rewound the tape, toggled ’byte flip’ switch and reread it. A second checksum error would kill the load, but 99% of the time it just read the tape and did the right thing. Our productivity shot up, and we pretty much ignored tape byte order from that point on.

—Steve Johnson

A good rule of thumb is this: Be adaptive unless doing so costs you 0.7 seconds or more of latency. 0.7 seconds is a magic number because, as Jef Raskin discovered while designing the Canon Cat, humans are almost incapable of noticing startup latency shorter than that; it gets lost in the mental overhead of changing the focus of attention.

Second, users should not see optimization switches. As a designer, it’s your job to make the program run economically, not the user’s. The marginal gains in performance that a user might collect from optimization switches are usually not worth the interface-complexity cost.

File-format nonsense (record length, blocking factor, etc) was blessedly eschewed by Unix, but the same kind of thing has roared back in excess configuration goo. KISS became MICAHI: make it complicated and hide it.

—Doug McIlroy

Finally, don’t do with a configuration switch what can be done with a script wrapper or a trivial pipeline. Don’t put complexity inside your program when you can easily enlist other programs to help get the work done. (Recall our discussion in Chapter 7 of why ls(1) does not have a built-in pager, or an option to invoke it).

Here are some more general questions to consider whenever you find yourself thinking about adding a configuration option:

• Can I leave this feature out? Why am I fattening the manual and burdening the user?

• Could the program’s normal behavior be changed in an innocuous way that would make the option unnecessary?

• Is this option merely cosmetic? Should I be thinking less about how to make the user interface configurable and more about how to make it right?

• Should the behavior enabled by this option be a separate program instead?

Proliferating unnecessary options has many bad effects. One of the subtlest but most serious is what it will do to your test coverage.

Unless it is done very carefully, the addition of an on/off configuration option can lead to a need to double the amount of testing. Since in practice one never does double the amount of testing, the practical effect is to reduce the amount of testing that any given configuration receives. Ten options leads to 1024 times as much testing, and pretty soon you are talking real reliability problems.

—Steve Johnson


### 10.2 Where Configurations Live
Classically, a Unix program can look for control information in five places in its startup-time environment:

• Run-control files under /etc (or at fixed location elsewhere in systemland).

• System-set environment variables.

• Run-control files (or ’dotfiles’) in the user’s home directory. (See Chapter 3 for a discussion of this important concept, if it is unfamiliar.)

• User-set environment variables.

• Switches and arguments passed to the program on the command line that invoked it.

These queries are usually done in the order listed above. That way, later (more local) settings override earlier (more global) ones. Settings found earlier can help the program compute locations for later retrievals of configuration data.

When thinking about which mechanism to use to pass configuration data to a program, bear in mind that good Unix practice demands using whichever one most closely matches the expected lifetime of the preference. Thus: for preferences which are very likely to change between invocations, use command-line switches. For preferences which change seldom, but that should be under individual user control, use a run-control file in the user’s home directory. For preference information that needs to be set sitewide by a system administrator and not changed by users, use a run-control file in system space.

We’ll discuss each of these places in more detail, then examine some case studies.


### 10.3 Run-Control Files
A run-control file is a file of declarations or commands associated with a program that it interprets on startup. If a program has site-specific configuration shared by all users at a site, it will often have a run-control file under the /etc directory. (Some Unixes have an /etc/conf subdirectory that collects such data.)

User-specific configuration information is often carried in a hidden run-control file in the user’s home directory. Such files are often called ’dotfiles’ because they exploit the Unix convention that a filename beginning with a dot is normally invisible to directory-listing tools.1

1 To make dotfiles visible, use the -a option of ls(1).

Programs can also have run-control or dot directories. These group together several configuration files that are related to the program, but that are most conveniently treated separately (perhaps because they relate to different subsystems of the program, or have differing syntaxes).

Whether file or directory, convention now dictates that the location of the run-control information has the same basename as the executable that reads it. An older convention still common among system programs uses the executable’s name with the suffix ’rc’ for ’run control’.2 Thus, if you write a program called ’seekstuff’ that has both sitewide and user-specific configuration, an experienced Unix user would expect to find the former at /etc/seekstuff and the latter at .seekstuff in the user’s home directory; but it would be unsurprising if the locations were /etc/seekstuffrc and .seekstuffrc, especially if seekstuff were a system utility of some sort.

2 The ’rc’ suffix goes back to Unix’s grandparent, CTSS. It had a command-script feature called "runcom". Early Unixes used ’rc’ for the name of the operating system’s boot script, as a tribute to CTSS runcom.

In Chapter 5 we described a somewhat different set of design rules for textual data-file formats, and discussed how to optimize for different weightings of interoperability, transparency and transaction economy. Run-control files are typically only read once at program startup and not written; economy is therefore usually not a major concern. Interoperability and transparency both push us toward textual formats designed to be read by human beings and modified with an ordinary text editor.

While the semantics of run-control files are of course completely program dependent, there are some design rules about run-control syntax that are widely observed. We’ll describe those next; but first we’ll describe an important exception.

If the program is an interpreter for a language, then it is expected to be simply a file of commands in the syntax of that language, to be executed at startup. This is an important rule, because Unix tradition strongly encourages the design of all kinds of programs as special-purpose languages and minilanguages. Well-known examples with dotfiles of this kind include the various Unix command shells and the Emacs programmable editor.

(One reason for this design rule is the belief that special cases are bad news—thus, that any switch that changes the behavior of a language should be settable from within the language. If as a language designer you find that you cannot express all the startup settings of a language in the the language itself, a Unix programmer would say you have a design problem—which is what you should be fixing, rather than devising a special-case run-control syntax.)

This exception aside, here are the normal style rules for run-control syntaxes. Historically, they are patterned on the syntax of Unix shells:

Support explanatory comments, and lead them with #. The syntax should also ignore whitespace before #, so that comments on the same line as configuration directives are supported.
Don’t make insidious whitespace distinctions. That is, treat runs of spaces and tabs, syntactically the same as a single space. If your directive format is line-oriented, it is good form to ignore trailing spaces and tabs on lines. The metarule is that the interpretation of the file should not depend on distinctions a human eye can’t see.
Treat multiple blank lines and comment lines as a single blank line. If the input format uses blank lines as separators between records, you probably want to ensure that a comment line does not end a record.
Lexically treat the file as a simple sequence of whitespace-separated tokens, or lines of tokens. Complicated lexical rules are hard to learn, hard to remember, and hard for humans to parse. Avoid them.
But, support a string syntax for tokens with embedded whitespace. Use single quote or double quote as balanced delimiters. If you support both, beware of giving them different semantics as they have in shell; this is a well-known source of confusion.
Support a backslash syntax for embedding unprintable and special characters in strings. The standard pattern for this is the backslash-escape syntax supported by C compilers. Thus, for example, it would be quite surprising if the string "a\tb" were not interpreted as a character ’a’, followed by a tab, followed by the character ’b’.
Some aspects of shell syntax, on the other hand, should not be emulated in run-control syntaxes—at least not without a good and specific reason. The shell’s baroque quoting and bracketing rules, and its special metacharacters for wildcards and variable substitution, both fall into this category.

It bears repeating that the point of these conventions is to reduce the amount of novelty that users have to cope with when they read and edit the run-control file for a program they have never seen before. Therefore, if you have to break the conventions, try to do so in a way that makes it visually obvious that you have done so, document your syntax with particular care, and (most importantly) design it so it’s easy to pick up by example.

These standard style rules only describe conventions about tokenizing and comments. The names of run-control files, their higher-level syntax, and the semantic interpretation of the syntax are usually application-specific. There are a very few exceptions to this rule, however; one is dotfiles which have become ’well-known’ in the sense that they routinely carry information used by a whole class of applications. Sharing run-control file formats in this way reduces the amount of novelty users have to cope with.

Of these, probably the best established is the .netrc file. Internet client programs that must track host/password pairs for a user can usually get them from the .netrc file, if it exists.


#### 10.3.1 Case Study: The .netrc File
The .netrc file is a good example of the standard rules in action. An example, with the passwords changed to protect the innocent, is in Example 10.1.


Example 10.1. A .netrc example.

images

Observe that this format is easy to parse by eyeball even if you’ve never seen it before; it’s a set of machine/login/password triples, each of which describes an account on a remote host. This kind of transparency is important—much more important, actually, than the time economy of faster interpretation or the space economy of a more compact and cryptic file format. It economizes the far more valuable resource that is human time, by making it likely that a human being will be able to read and modify the format without having to read a manual or use a tool less familiar than a plain old text editor.

Observe also that this format is used to supply information for multiple services—an advantage, because it means sensitive password information need only be stored in one place. The .netrc format was designed for the original Unix FTP client program. It’s used by all FTP clients, and also understood by some telnet clients, and by the smbclient(1) command-line tool, and by the fetchmail program. If you are writing an Internet client that must do password authentication through remote logins, the Rule of Least Surprise demands that it use the contents of .netrc as defaults.


#### 10.3.2 Portability to Other Operating Systems
Systemwide run-control files are a design tactic that can be used on almost any operating system, but dotfiles are rather more difficult to map to a non-Unix environment. The critical thing missing from most non-Unix operating systems is true multiuser capability and the notion of a per-user home directory. DOS and Windows versions up to ME (including 95 and 98), for example, completely lack any such notion; all configuration information has to be stored either in systemwide run-control files at a fixed location, the Windows registry, or configuration files in the same directory a program is run from. Windows NT has some notion of per-user home directories (which made its way into Windows 2000 and XP), but it is only poorly supported by the system tools.


### 10.4 Environment Variables
When a Unix program starts up, the environment accessible to it includes a set of name to value associations (names and values are both strings). Some of these are set manually by the user; others are set by the system at login time, or by your shell or terminal emulator (if you’re running one). Under Unix, environment variables tend to carry information about file search paths, system defaults, the current user ID and process number, and other key bits of information about the runtime einvironment of programs. At a shell prompt, typing set followed by a newline will list all currently defined shell variables.

In C and C++ these values can be queried with the library function getenv(3). Perl and Python initialize environment-dictionary objects at startup. Other languages generally follow one of these two models.


#### 10.4.1 System Environment Variables
There are a number of well-known environment variables you can expect to find defined on startup of a program from the Unix shell. These (especially HOME) will often need to be evaluated before you read a local dotfile.

USER

Login name of the account under which this session is logged in (BSD convention).

LOGNAME

Login name of the account under which this session is logged in (System V  convention).

HOME

Home directory of the user running this session.

COLUMNS

The number of character-cell columns on the controlling terminal or terminal-emulator window.

LINES

The number of character-cell rows on the controlling terminal or terminal-emulator window.

SHELL

The name of the user’s command shell (often used by shellout commands).

PATH

The list of directories that the shell searches when looking for executable commands to match a name.

TERM

Name of the terminal type of the session console or terminal emulator window (see the terminfo case study in Chapter 6 for background). TERM is special in that programs to create remote sessions over the network (such as telnet and ssh) are expected to pass it through and set it in the remote session.

(This list is representative, but not exhaustive.)

The HOME variable is especially important, because many programs use it to find the calling user’s dotfiles (others call some functions in the C runtime library to get the calling user’s home directory).

Note that some or all of these system environment variables may not be set when a program is started by some other method than a shell spawn. In particular, daemon listeners on a TCP/IP socket often don’t have these variables set—and if they do, the values are unlikely to be useful.

Finally, note that there is a tradition (exemplified by the PATH variable) of using a colon as a separator when an environment variable must contain multiple fields, especially when the fields can be interpreted as a search path of some sort. Note that some shells (notably bash and ksh) always interpret colon-separated fields in an environment variable as filenames, which means in particular that they expand ~ in these fields to the user’s home directory.


#### 10.4.2 User Environment Variables
Although applications are free to interpret environment variables outside the system-defined set, it is nowadays fairly unusual to actually do so. Environment values are not really suitable for passing structured information into a program (though it can in principle be done via parsing of the values). Instead, modern Unix applications tend to use run-control files and dotfiles.

There are, however, some design patterns in which user-defined environment variables can be useful:

Application-independent preferences that need to be shared by a large number of different programs. This set of ’standard’ preferences changes only slowly, because lots of different programs need to recognize each one before it becomes useful.3 Here are the standard ones:

3 Nobody knows a really graceful way to represent this sort of distributed preference data; environment variables probably are not it, but all the known alternatives have equally nasty problems.

EDITOR

The name of the user’s preferred editor (often used by shellout commands).4

4 Actually, most Unix programs first check VISUAL, and only if that’s not set will they consult EDITOR. That’s a relic from the days when people had different preferences for line-oriented editors and visual editors.

MAILER

The name of the user’s preferred mail user agent (often used by shellout commands).

PAGER

The name of the user’s preferred program for browsing plaintext.

BROWSER

The name of the user’s preferred program for browsing Web URLs. This one, as of 2003, is still very new and not yet widely implemented.


#### 10.4.3 When to Use Environment Variables
What both user and system environment variables have in common is that it would be annoying to have to replicate the information they contain in a large number of application run-control files, and extremely annoying to have to change that information everywhere when your preference changes. Typically, the user sets these variables in his or her shell session startup file.

A value varies across several contexts that share dotfiles, or a parent needs to pass information to multiple child processes. Some pieces of start-up information are expected to vary across several contexts in which the calling user would share common run-control files and dotfiles. For a system-level example, consider several shell sessions open through terminal emulator windows on an X desktop. They will all see the same dotfiles, but might have different values of COLUMNS, LINES, and TERM. (Old-school shell programming used this method extensively; makefiles still do.)

A value varies too often for dotfiles, but doesn’t change on every startup. A user-defined environment variable may (for example) be used to pass a file-system or Internet location that is the root of a tree of files that the program should play with. The CVS version-control system interprets the variable CVSROOT this way, for example. Several newsreader clients that fetch news from servers using the NNTP protocol interpret the variable NNTPSERVER as the location of the server to query.

A process-unique override needs to be expressed in a way that doesn’t require the command-line invocation to be changed. A user-defined environment variable can be useful for situations in which, for whatever reason, it would be inconvenient to have to change an application dotfile or supply command-line options (perhaps it is expected that the application will normally be used inside a shell wrapper or within a makefile). A particularly important context for this sort of use is debugging. Under Linux, for example, manipulating the variable LD_LIBRARY_PATH associated with the ld(1) linking loader enables you to change where libraries are loaded from—perhaps to pick up versions that do buffer-overflow checking or profiling.

In general, a user-defined environment variable can be an effective design choice when the value changes often enough to make editing a dotfile each time inconvenient, but not necessarily every time (so always setting the location with a command-line option would also be inconvenient). Such variables should typically be evaluated after a local dotfile and be permitted to override settings in it.

There is one traditional Unix design pattern that we do not recommend for new programs. Sometimes, user-set environment variables are used as a lightweight substitute for expressing a program preference in a run-control file. The venerable nethack(1) dungeon-crawling game, for example, reads a NETHACKOPTIONS environment variable for user preferences. This is an old-school technique; modern practice would lean toward parsing them from a .nethack or .nethackrc run-control file.

The problem with the older style is that it makes tracking where your preference information lives more difficult than it would be if you knew the program had a run-control file under your home directory. Environment variables can be set anywhere in several different shell run-control files—under Linux these are likely to include .profile, .bash_profile, and .bashrc at least. These files are cluttered and fragile things, so as the code overhead of having an option-parser has come to seem less significant preference information has tended to migrate out of environment variables into dotfiles.


#### 10.4.4 Portability to Other Operating Systems
Environment variables have only very limited portability off Unix. Microsoft operating systems have an environment-variable feature modeled on that of Unix, and use a PATH variable as Unix does to set the binary search path, but most of other variables that Unix shell programmers take for granted (such as process ID or current working directory) are not supported. Other operating systems (including classic MacOS) generally do not have any local equivalent of environment variables.


### 10.5 Command-Line Options
Unix tradition encourages the use of command-line switches to control programs, so that options can be specified from scripts. This is especially important for programs that function as pipes or filters. Three conventions for how to distinguish command-line options from ordinary arguments exist; the original Unix style, the GNU style, and the X toolkit style.

In the original Unix tradition, command-line options are single letters preceded by a single hyphen. Mode-flag options that do not take following arguments can be ganged together; thus, if -a and -b are mode options, -ab or -ba is also correct and enables both. The argument to an option, if any, follows it (optionally separated by whitespace). In this style, lowercase options are preferred to uppercase. When you use uppercase options, it’s good form for them to be special variants of the lowercase option.

The original Unix style evolved on slow ASR-33 teletypes that made terseness a virtue; thus the single-letter options. Holding down the shift key required actual effort; thus the preference for lower case, and the use of “–” (rather than the perhaps more logical “+”) to enable options.

The GNU style uses option keywords (rather than keyword letters) preceded by two hyphens. It evolved years later when some of the rather elaborate GNU utilities began to run out of single-letter option keys (this constituted a patch for the symptom, not a cure for the underlying disease). It remains popular because GNU options are easier to read than the alphabet soup of older styles. GNU-style options cannot be ganged together without separating whitespace. An option argument (if any) can be separated by either whitespace or a single “=” (equal sign) character.

The GNU double-hyphen option leader was chosen so that traditional single-letter options and GNU-style keyword options could be unambiguously mixed on the same command line. Thus, if your initial design has few and simple options, you can use the Unix style without worrying about causing an incompatible ’flag day’ if you need to switch to GNU style later on. On the other hand, if you are using the GNU style, it is good practice to support single-letter equivalents for at least the most common options.

The X toolkit style, confusingly, uses a single hyphen and keyword options. It is interpreted by X toolkits that filter out and process certain options (such as -geometry and -display) before handing the filtered command line to the application logic for interpretation. The X toolkit style is not properly compatible with either the classic Unix or GNU styles, and should not be used in new programs unless the value of being compatible with older X conventions seems very high.

Many tools accept a bare hyphen, not associated with any option letter, as a pseudo-filename directing the application to read from standard input. It is also conventional to recognize a double hyphen as a signal to stop option interpretation and treat all following arguments literally.

Most Unix programming languages offer libraries that will parse a command line for you in either classic-Unix or GNU style (interpreting the double-hyphen convention as well).


#### 10.5.1 The -a to -z of Command-Line Options
Over time, frequently-used options in well-known Unix programs have established a loose sort of semantic standard for what various flags might be expected to mean. The following is a list of options and meanings that should prove usefully unsurprising to an experienced Unix user:

-a

All (without argument). If there is a GNU-style --all option, for -a to be anything but a synonym for it would be quite surprising. Examples: fuser(1), fetchmail(1).

Append, as in tar(1). This is often paired with -d for delete.

-b

Buffer or block size (with argument). Set a critical buffer size, or (in a program having to do with archiving or managing storage media) set a block size. Examples: du(1), df(1), tar(1).

Batch. If the program is naturally interactive, -b may be used to suppress prompts or set other options appropriate to accepting input from a file rather than a human operator. Example: flex(1).

-c

Command (with argument). If the program is an interpreter that normally takes commands from standard input, it is expected that the option of a -c argument will be passed to it as a single line of input. This convention is particularly strong for shells and shell-like interpreters. Examples: sh(1), ash(1), bsh(1), ksh(1), python(1). Compare -e below.

Check (without argument). Check the correctness of the file argument(s) to the command, but don’t actually perform normal processing. Frequently used as a syntax-check option by programs that do interpretation of command files. Examples: getty(1), perl(1).

-d

Debug (with or without argument). Set the level of debugging messages. This one is very common.

Occasionally -d has the sense of ’delete’ or ’directory’.

-D

Define (with argument). Set the value of some symbol in an interpreter, compiler, or (especially) macro-processor-like application. The model is the use of -D by the C compiler’s macro preprocessor. This is a strong association for most Unix programmers; don’t try to fight it.

-e

Execute (with argument). Programs that are wrappers, or that can be used as wrappers, often allow -e to set the program they hand off control to. Examples: xterm(1), perl(1).

Edit. A program that can open a resource in either a read-only or editable mode may allow -e to specify opening in the editable mode. Examples: crontab(1), and the get(1) utility of the SCCS version-control system.

Occasionally -e has the sense of ’exclude’ or ’expression’.

-f

File (with argument). Very often used with an argument to specify an input (or, less frequently, output) file for programs that need to randomly access their input or output (so that redirection via < or > won’t suffice). The classic example is tar(1); others abound. It is also used to indicate that arguments normally taken from the command line should be taken from a file instead; see awk(1) and egrep(1) for classic examples. Compare -o below; often, -f is the input-side analog of -o.

Force (typically without argument). Force some operation (such as a file lock or unlock) that is normally performed conditionally. This is less common.

Daemons often use -f in a way that combines these two meanings, to force processing of a configuration file from a nondefault location. Examples: ssh(1), httpd(1), and many other daemons.

-h

Headers (typically without argument). Enable, suppress, or modify headers on a tabular report generated by the program. Examples: pr(1), ps(1).

Help. This is actually less common than one might expect offhand—for much of Unix’s early history developers tended to think of on-line help as memory-footprint overhead they couldn’t afford. Instead they wrote manual pages (this shaped the man-page style in ways we’ll discuss in Chapter 18).

-i

Initialize (usually without argument). Set some critical resource or database associated with the program to an initial or empty state. Example: ci(1) in RCS.

Interactive (usually without argument). Force a program that does not normally query for confirmation to do so. There are classical examples (rm(1), mv(1)) but this use is not common.

-I

Include (with argument). Add a file or directory name to those searched for resources by the application. All Unix compilers with any equivalent of source-file inclusion in their languages use -I in this sense. It would be extremely surprising to see this option letter used in any other way.

-k

Keep (without argument). Suppress the normal deletion of some file, message, or resource. Examples: passwd(1), bzip(1), and fetchmail(1).

Occasionally -k has the sense of ’kill’.

-l

List (without argument). If the program is an archiver or interpreter/player for some kind of directory or archive format, it would be quite surprising for -l to do anything but request an item listing. Examples: arc(1), binhex(1), unzip(1). (However, tar(1) and cpio(1) are exceptions.)

In programs that are already report generators, -l almost invariably means “long” and triggers some kind of long-format display revealing more detail than the default mode. Examples: ls(1), ps(1).

Load (with argument). If the program is a linker or a language interpreter, -l invariably loads a library, in some appropriate sense. Examples: gcc(1), f77(1), emacs(1).

Login. In programs such as rlogin(1) and ssh(1) that need to specify a network identity, -l is how you do it.

Occasionally -l has the sense of ’length’ or ’lock’.

-m

Message (with argument). Used with an argument, -m passes it in as a message string for some logging or announcement purpose. Examples: ci(1), cvs(1).

Occasionally -m has the sense of ’mail’, ’mode’, or ’modification-time’.

-n

Number (with argument). Used, for example, for page number ranges in programs such as head(1), tail(1), nroff(1), and troff(1). Some networking tools that normally display DNS names accept -n as an option that causes them to display the raw IP addresses instead; ifconfig(1) and tcpdump(1) are the archetypal examples.

Not (without argument). Used to suppress normal actions in programs such as make(1).

-o

Output (with argument). When a program needs to specify an output file or device by name on the command line, the -o option does it. Examples: as(1), cc(1), sort(1). On anything with a compiler-like interface, it would be extremely surprising to see this option used in any other way. Programs that support -o often (like gcc) have logic that allows it to be recognized after ordinary arguments as well as before.

-p

Port (with argument). Especially used for options that specify TCP/IP port numbers. Examples: cvs(1), the PostgreSQL tools, the smbclient(1), snmpd(1), ssh(1).

Protocol (with argument). Examples: fetchmail(1), snmpnetstat(1).

-q

Quiet (usually without argument). Suppress normal result or diagnostic output. This is very common. Examples: ci(1), co(1), make(1). See also the ’silent’ sense of -s.

-r (also -R)

Recurse (without argument). If the program operates on a directory, then this option might tell it to recurse on all subdirectories. Any other use in a utility that operated on directories would be quite surprising. The classic example is, of course, cp(1).

Reverse (without argument). Examples: ls(1), sort(1). A filter might use this to reverse its normal translation action (compare -d).

-s

Silent (without argument). Suppress normal diagnostic or result output (similar to -q; when both are supported, q means ’quiet’ but -s means ’utterly silent’). Examples: csplit(1), ex(1), fetchmail(1).

Subject (with argument). Always used with this meaning on commands that send or manipulate mail or news messages. It is extremely important to support this, as programs that send mail expect it. Examples: mail(1), elm(1), mutt(1).

Occasionally -s has the sense of ’size’.

-t

Tag (with argument). Name a location or give a string for a program to use as a retrieval key. Especially used with text editors and viewers. Examples: cvs(1), ex(1), less(1), vi(1).

-u

User (with argument). Specify a user, by name or numeric UID. Examples: crontab(1), emacs(1), fetchmail(1), fuser(1), ps(1).

-v

Verbose (with or without argument). Used to enable transaction-monitoring, more voluminous listings, or debugging output. Examples: cat(1), cp(1), flex(1), tar(1), many others.

Version (without argument). Display program’s version on standard output and exit. Examples: cvs(1), chattr(1), patch(1), uucp(1). More usually this action is invoked by -V.

-V

Version (without argument). Display program’s version on standard output and exit (often also prints compiled-in configuration details as well). Examples: gcc(1), flex(1), hostname(1), many others. It would be quite surprising for this switch to be used in any other way.

-w

Width (with argument). Especially used for specifying widths in output formats. Examples: faces(1), grops(1), od(1), pr(1), shar(1).

Warning (without argument). Enable warning diagnostics, or suppress them. Examples: fetchmail(1), flex(1), nsgmls(1).

-x

Enable debugging (with or without argument). Like -d. Examples: sh(1), uucp(1).

Extract (with argument). List files to be extracted from an archive or working set. Examples: tar(1), zip(1).

-y

Yes (without argument). Authorize potentially destructive actions for which the program would normally require confirmation. Examples: fsck(1), rz(1).

-z

Enable compression (without argument). Archiving and backup programs often use this. Examples: bzip(1), GNU tar(1), zcat(1), zip(1), cvs(1).

The preceding examples are taken from the Linux toolset, but should be good on most modern Unixes.

When you’re choosing command-line option letters for your program, look at the manual pages for similar tools. Try to use the same option letters they use for the analogous functions of your program. Note that some particular application areas that have particularly strong conventions about command-line switches which you violate at your peril—compilers, mailers, text filters, network utilities and X software are all notable for this. Anybody who wrote a mail agent that used -s as anything but a Subject switch, for example, would have scorn rightly heaped upon the choice.

The GNU project recommends conventional meanings for a few double-dash options in the GNU coding standards.5 It also lists long options which, though not standardized, are used in many GNU programs. If you are using GNU-style options, and some option you need has a function similar to one of those listed, by all means obey the Rule of Least Surprise and reuse the name.

5 See the Gnu Coding Standards <http://www.gnu.org/prep/standards.html>.


#### 10.5.2 Portability to Other Operating Systems
To have command-line options, you have to have a command line. The MS-DOS family does, of course, though in Windows it’s hidden by a GUI and its use is discouraged; the fact that the option character is normally ’/’ rather than ’-’ is merely a detail. MacOS classic and other pure GUI environments have no close equivalent of command-line options.


### 10.6 How to Choose among the Methods
We’ve looked in turn at system and user run-control files, at environment variables, and at command-line arguments. Observe the progression from least easily changed to most easily changed. There is a strong convention that well-behaved Unix programs that use more than one of these places should look at them in the order given, allowing later settings to override earlier ones (there are specific exceptions, such as command-line options that specify where a dotfile should be found).

In particular, environment settings usually override dotfile settings, but can be overridden by command-line options. It is good practice to provide a command-line option like the -e of make(1) that can override environment settings or declarations in run-control files; that way the program can be scripted with well-defined behavior regardless of the way the run-control files look or environment variables are set.

Which of these places you choose to look at depends on how much persistent configuration state your program needs to keep around between invocations. Programs designed mainly to be used in a batch mode (as generators or filters in pipelines, for example) are usually completely configured with command-line options. Good examples of this pattern include ls(1), grep(1) and sort(1). At the other extreme, large programs with complicated interactive behavior may rely entirely on run-control files and environment variables, and normal use involves few command-line options or none at all. Most X window managers are a good example of this pattern.

(Unix has the capability for the same file to have multiple names or ’links’. At startup time, every program has available to it the filename through which it was called. One other way to signal to a program that has several modes of operation which one it should come up in is to give it a link for each mode, have it find out which link it was called through, and change its behavior accordingly. But this technique is generally considered unclean and seldom used.)

Let’s look at a couple of programs that gather configuration data from all three places. It will be instructive to consider why, for each given piece of configuration data, it is collected as it is.


#### 10.6.1 Case Study: fetchmail
The fetchmail program uses only two environment variables, USER and HOME. These variables are in the predefined set initialized by the system; many programs use them.

The value of HOME is used to find the dotfile .fetchmailrc, which contains configuration information in a fairly elaborate syntax obeying the shell-like lexical rules described above. This is appropriate because, once it has been initially set up, Fetchmail’s configuration will change only infrequently.

There is neither an /etc/fetchmailrc nor any other systemwide file specific to fetchmail. Normally such files hold configuration that’s not specific to an individual user. fetchmail does use a small set of properties with this kind of scope—specifically, the name of the local postmaster, and a few switches and values describing the local mail transport setup (such as the port number of the local SMTP listener). In practice, however, these are seldom changed from their compiled-in default values. When they are changed, they tend to be modified in user-specific ways. Thus, there has been no demand for a systemwide fetchmail run-control file.

Fetchmail can retrieve host/login/password triples from a .netrc file. Thus, it gets authenticator information in the least surprising way.

Fetchmail has an elaborate set of command-line options, which nearly but do not entirely replicate what the .fetchmailrc can express. The set was not originally large, but grew over time as new constructs were added to the .fetchmailrc minilanguage and parallel command-line options for them were added more or less reflexively.

The intent of supporting all these options was to make fetchmail easier to script by allowing users to override bits of its run control from the command line. But it turns out that outside of a few options like --fetchall and --verbose there is little demand for this—and none that can’t be satisfied with a shellscript that creates a temporary run-control file on the fly and then feeds it to fetchmail using the -f option.

Thus, most of the command-line options are never used, and in retrospect including them was probably a mistake; they bulk up the fetchmail code a bit without accomplishing anything very useful.

If bulking up the code were the only problem, nobody would care, except for a couple of maintainers. However, options increase the chances of error in code, particularly due to unforeseen interactions among rarely used options. Worse, they bulk up the manual, which is a burden on everybody.

—Doug McIlroy

There is a lesson here; had I thought carefully enough about fetchmail’s usage pattern and been a little less ad-hoc about adding features, the extra complexity might have been avoided.

An alternative way of dealing with such situations, which doesn’t clutter up either the code or the manual much, is to have a “set option variable” option, such as the -O option of sendmail, which lets you specify an option name and value, and sets that name to that value as if such a setting had been given in a configuration file. A more powerful variant of this is what ssh does with its -o option: the argument to -o is treated as if it were a line appended to the configuration file, with the full config-file syntax available. Either of these approaches gives people with unusual requirements a way to override configuration from the command line, without requiring you to provide a separate option for each bit of configuration that might be overridden.

—Henry Spencer


#### 10.6.2 Case Study: The XFree86 Server
The X windowing system is the engine that supports bitmapped displays on Unix machines. Unix applications running through a client machine with a bitmapped display get their input events through X and send screen-painting requests to it. Confusingly, X ’servers’ actually run on the client machine—they exist to serve requests to interact with the client machine’s display device. The applications sending those requests to the X server are called ’X clients’, even though they may be running on a server machine. And no, there is no way to explain this inverted terminology that is not confusing.

X servers have a forbiddingly complex interface to their environment. This is not surprising, as they have to deal with a wide range of complex hardware and user preferences. The environment queries common to all X servers, documented on the X(1) and Xserver(1) pages, therefore make a useful example for study. The implementation we examine here is XFree86, the X implementation used under Linux and several other open-source Unixes.

At startup, the XFree86 server examines a systemwide run-control file; the exact pathname varies between X builds on different platforms, but the basename is XF86Config. The XF86Config file has a shell-like syntax as described above. Example 10.2 is a sample section of an XF86Config file.


Example 10.2. X configuration example.

images

The XF86Config file describes the host machine’s display hardware (graphics card, monitor), keyboard, and pointing device (mouse/trackball/glidepad). It’s appropriate for this information to live in a systemwide run-control file, because it applies to all users of the machine.

Once X has acquired its hardware configuration from the run control file, it uses the value of the environment variable HOME to find two dotfiles in the calling user’s home directory. These files are .Xdefaults and .xinitrc.6

6 The .xinitrc is analogous to a Startup folder on Windows and other operating systems.

The .Xdefaults file specifies per-user, application-specific resources relevant to X (trivial examples of these might include font and foreground/background colors for a terminal emulator). The phrase ’relevant to X’ indicates a design problem, however. Collecting all these resource declarations in one place is convenient for inspecting and editing them, but it is not always clear what should be declared in .Xdefaults and what belongs in an application-specific dotfile. The .xinitrc file specifies the commands that should be run to initialize the user’s X desktop just after server startup. These programs will almost always include a window or session manager.

X servers have a large set of command-line options. Some of these, such as the -fp (font path) option, override the XF86Config. Some are intended to help track server bugs, such as the -audit option; if these are used at all, they are likely to vary quite frequently between test runs and are therefore poor candidates to be included in a run-control file. A very important option is the one that sets the server’s display number. Multiple servers may run on a host provided each has a unique display number, but all instances share the same run-control file(s); thus, the display number cannot be derived solely from those files.


### 10.7 On Breaking These Rules
The conventions described in this chapter are not absolute, but violating them will increase friction costs for users and developers in the future. Break them if you must—but be sure you know exactly why you are doing so before you do it. And if you do break them, make sure that attempts to do things in conventional ways break noisily, giving proper error feedback in accordance with the Rule of Repair.

## 11. Interfaces: User-Interface Design Patterns in the Unix Environment

All our knowledge has its origins in our perceptions.

—Leonardo Da Vinci

The interface of a program is the sum of all the ways that it communicates with human users and other programs. In Chapter 10, we discussed the use of environment variables, switches, run-control files and other parts of start-up-time interfaces. In this chapter, we’ll untangle the history and explain the pragmatics of Unix interfaces after startup time. Because user-interface code normally consumes 40% or more of development time, knowing good design patterns is especially important here in order to avoid a lot of false starts and time-intensive rewrites.

In the Unix tradition of interface design, we encounter two themes over and over again. One is anticipatory design for communication with other programs; the other is the Rule of Least Surprise.

Unix programs can give you extra power from being used in synergistic combinations; we discussed various methods for hooking together such combinations in Chapter 7. The ’other programs’ part of Unix interface design is not an afterthought or a marginal case as it is under many other operating systems. Rather, it is a central challenge that has to be balanced and integrated carefully with the demands of interface design for human users.

Much of Unix-community tradition about program interface design may seem odd and arbitrary—or even, in the age of the GUI, downright regressive—when you encounter that tradition for the first time. But in spite of various blemishes and irregularities, that tradition has an inner logic to it which is worth learning and understanding. It reflects heuristics accumulated over Unix’s long history about ways to do effective communication both with human beings and with other programs. And it includes a set of conventions which create commonalities between programs—it defines ’least surprising’ alternatives for a wide range of common interface-design problems.

After startup, programs normally get input or commands from the following sources:

• Data and commands presented on the program’s standard input.

• Inputs passed through IPC, such as X server events and network messages.

• Files and devices in known locations (such as a data file name passed to or computed by the program).

Programs can emit results in all the same ways (with output going to standard output).

Some Unix programs are graphical, some have screen-oriented character interfaces, and some use a starkly simple text-filter design unchanged from the days of mechanical teletypes. To the uninitiated, it is often far from obvious why any given program uses the style it does—or, indeed, why Unix supports such a plethora of interface styles at all.

Unix has several competing interface styles. All are still alive for a reason; they’re optimized for different situations. By understanding the fit between task and interface style, you will learn how to choose the right styles for the jobs you need to do.


### 11.1 Applying the Rule of Least Surprise
The Rule of Least Surprise is a general principle in the design of all kinds of interfaces, not just software: “Do the least surprising thing”. It’s a consequence of the fact that human beings can only pay attention to one thing at one time (see The Humane Interface [Raskin]). Surprises in the interface focus that single locus of attention on the interface, rather than on the task where it belongs.

Thus, to design usable interfaces, it’s best when possible not to design an entire new interface model. Novelty is a barrier to entry; it puts a learning burden on the user, so minimize it. Instead, think carefully about the experience and knowledge of your user base. Try to find functional similarities between your program and programs they are likely to already know about. Then mimic the relevant parts of the existing interfaces.

The Rule of Least Surprise should not be interpreted as a call for mechanical conservatism in design. Novelty raises the cost of a user’s first few interactions with an interface, but poor design will make the interface needlessly painful forever. As in other sorts of design, rules are not a substitute for good taste and engineering judgment. Consider your tradeoffs carefully—and consider them from the user’s point of view. The bias implied by the Rule of Least Surprise is a good one to hold consciously, mainly because interface designers (like other programmers) have an unconscious tendency to be too clever for the user’s good.

One implication of the Rule of Least Surprise is this: Wherever possible, allow the user to delegate interface functions to a familiar program. We already observed in Chapter 7 that, if your program requires the user to edit significant amounts of text, you should write it to call an editor (specifiable by the user) rather than building in your own integrated editor. This will enable the users, who know their preferences better than you, to choose the least surprising alternative.

Elsewhere in this book we have advocated symbiosis and delegation as tactics for promoting code reuse and minimizing complexity. The point here is that when users can intercept the delegation, and direct it to an agent of their own choice, these techniques become not merely economical for the developer but actively empowering to users.

Further: When you can’t delegate, emulate. The purpose of the Rule of Least Surprise is to reduce the amount of complexity a user must absorb to use an interface. Continuing the editor example, this means that if you must implement an embedded editor, it’s best if the editor commands are a subset of those for a well-known general-purpose editor. (Or more than one. Both bash and ksh have command-line editors that allow the user to choose between vi and Emacs editing styles.)

Under the Unix versions of the Netscape and Mozilla Web browsers, for example, fill-in fields in forms recognize a subset of the default bindings for the Emacs editor. Control-A goes to start of line, Control-D deletes the next character, and so forth. This choice helps people who know Emacs, and leaves others no worse off than an arbitrary, idiosyncratic command set would have. The only way it could have been bettered was by choosing key bindings associated with some editor significantly more widely used than Emacs; and among Netscape’s original user population there was no such animal.

These principles can be applied in many other areas of interface design. They suggest, for example, that it is deeply foolish to create novel document formats for an on-line help system when users are comfortable with an HTML Web browser. Or even that if you are designing an arcade-style game, it is wise to look at the gesture sets of previous games to see if you can give new users a feeling of comfort by allowing them to transfer joystick skills learned in other games.


### 11.2 History of Interface Design on Unix
Unix predates the modern graphics-intensive style of software interface design. For over a decade after the first Unix in 1969, command-line interfaces (CLIs) on teletypes and dumb text-mode terminals were the norm. Most of the basic Unix toolset (programs like ls(1), cat(1), and grep(1)) still reflect this heritage.

Gradually, after 1980, Unix evolved support for screen-painting on character-cell terminals. Programs began to mix command-line and visual interfaces, with common commands often bound to keystrokes that would not be echoed to the screen. Some of the early programs written in this style (often called ’curses’ programs, after the screen-painting cursor-control library normally used to implement them, or ’roguelike’ after the first application to use curses) are still used today; notable examples include the dungeon-crawling game rogue(1), the vi(1) text editor, and (from a few years later) the elm(1) mailer and its modern descendant mutt(1).

A few years later in the mid-1980s, the computing world as a whole began to assimilate the results of the pioneering work on graphical user interfaces (GUIs) that had been going on at Xerox’s Palo Alto Research Center since the early 1970s. On personal computers, the Xerox PARC work inspired the Apple Macintosh interface and through that the design of Microsoft Windows. Unix’s adaptation of these ideas took a rather more complicated path.

Around 1987 the X windowing system outcompeted several early contenders and prototype efforts to become the standard graphical-interface facility for Unix. Whether this was a good or a bad thing has remained a topic of debate ever since; some of the other contenders (notably Sun’s Network Window System or NeWS) were arguably rather more powerful and elegant. X, however, had one overriding virtue; it was open source. The code had been developed at MIT by a research group more interested in exploring the problem space than in creating a product, and it remained freely redistributable and modifiable. It was thus able to attract support from a wide range of developers and sponsoring corporations who would have been reluctant to line up behind a single vendor’s closed product. (This, of course, prefigured an important theme in the breakout of the Linux operating system ten years later.)

The designers of X decided early on that X would support “mechanism, not policy”. Their objective was to make X as flexible and portable across platforms as possible, while putting as few constraints on the look and feel of X programs as they could manage. Look and feel, they decided, would be handled by ’toolkits’—libraries calling X services linked to user programs. X would also be designed to support multiple window managers,1 and would not require a window manager to have any special privileges or uniquely close integration with X’s machinery.

1 A window manager handles associations between windows on the screen and running tasks. Window managers handle behaviors like title bars, placement, minimizing, maximizing, moving, resizing, and shading windows.

This approach was the polar opposite of that taken by the Macintosh and Windows commercial products, which enforced particular look-and-feel policies by designing them right into the system. The difference in approach ensured that X would have a long-run evolutionary advantage by remaining adaptable as new discoveries were made about the human factors in interface design—but it also ensured that the X world would be divided by multiple toolkits, a profusion of window managers, and many experiments in look and feel.

Since the mid-1990s X has become ubiquitous even on the lowest-end personal Unix machines. Use of Unix from text-mode terminals, as opposed to graphics-capable computer consoles, has sharply declined and seems headed for extinction. Accordingly, the use of curses-style interfaces for new applications is also in decline; most new applications that would formerly have been designed in that style now use an X toolkit. It is instructive to note that Unix’s older CLI design tradition is still quite vigorous and successfully competes with X in many areas.

It is also instructive to note that there are a few specific application areas in which curses-style (or ’roguelike’) character-cell interfaces remain the norm—especially text editors and interactive communications programs such as mailers, newsreaders, and chat clients.

For historical reasons, then, there is a wide range of interface styles in Unix programs. Line-oriented, character-cell screen-oriented, and X-based—with the X-based world somewhat balkanized by the competition between multiple X toolkits and window managers (though this is less an issue in 2003 than was the case five or even three years ago).


### 11.3 Evaluating Interface Designs
All these interface styles survive because they are adapted for different jobs. When making design decisions about a project, it’s important to know how to pick a style (or combine styles) that will be appropriate to your application and your user population.

We will use five basic metrics to categorize interface styles: concision, expressiveness, ease, transparency, and scriptability. We’ve already used some of these terms earlier in this book in ways that were preparation for defining them here. They are comparatives, not absolutes; they have to be evaluated with respect to a particular problem domain and with some knowledge of the users’ skill base. Nevertheless, they will help organize our thinking in useful ways.

A program interface is ’concise’ when the length and complexity of actions required to do a transaction with it has a low upper bound (the measurement might be in keystrokes, gestures, or seconds of attention required). Concise interfaces pack a lot of leverage into a relatively few bits or state changes.

Interfaces are ’expressive’ when they can readily be used to command a wide variety of actions. The most expressive interfaces can command combinations of actions not anticipated by the designer of the program, but which nevertheless give the user useful and consistent results.

The difference between concision and expressiveness is an important one. Consider two different ways of entering text: from a keyboard, or by picking characters from a screen display with mouse clicks. These have equal expressiveness, but the keyboard is more concise (as we can easily verify by comparing average text-entry speeds). On the other hand, consider two dialects of the same programming language, one with a complex-number type and one not. Within the problem domain they have in common, their concision will be identical; but for a mathematician or electrical engineer, the dialect with complex numbers will be much more expressive.

The ’ease’ of an interface is inversely proportional to the mnemonic load it puts on the user—how many things (commands, gestures, primitive concepts) the user has to remember specifically to support using that interface. Programming languages have a high mnemonic load and low ease; menus and well-labeled on-screen buttons are simpler.

Recall that we devoted an entire earlier chapter to ’transparency’. In that chapter we touched on the idea of interface transparency, and gave the audacity audio editor as one superb example of it. But we were then much more interested in transparency of a different kind, one that relates to the structure of code rather than of user interfaces. We therefore described UI transparency in terms of its effect (nothing obtrudes between the user and the problem domain) rather than the specific features of design that produce it. Now it’s time to zero in on these.

The ’transparency’ of an interface is how few things the user has to remember about the state of his problem, his data, or his program while using the interface. An interface has high transparency when it naturally presents intermediate results, useful feedback, and error notifications on the effects of a user’s actions. So-called WYSIWYG (What You See Is What You Get) interfaces are intended to maximize transparency, but sometimes backfire—especially by presenting an over-simplified view of the domain.

The related concept of discoverability applies to interface design, as well. A discoverable interface provides the user with assistance in learning it, such as a greeting message pointing to context-sensitive help, or explanatory balloon popups. Though discoverability has to be implemented in rather different ways for each of the interface styles we shall consider, the degree to which it is achievable is largely independent of interface style. Thus, we shall not use it as a metric in this discussion.

Note that transparency of code and design does not automatically imply transparency of interface, or vice versa! It is all too easy to point to code that has one but not the other.

The ’scriptability’ of an interface is the ease with which it can be manipulated by other programs (e.g., through the IPC mechanisms discussed in Chapter 7). Scriptable programs are readily usable as components by other programs, reducing the need for costly custom coding and making it relatively easy to automate repetitive tasks.

That last point—automating repetitive tasks—deserves more attention than it usually gets. Unix programmers, administrators, and users develop a habit of thinking through the routine procedures they use, then packaging them so they no longer have to manually execute or even think about them any more. This habit depends on scriptable interfaces. It is a quiet but tremendous productivity booster not available in most other software environments.

It will be useful to bear in mind that humans and computer programs have very different cost functions with respect to these metrics. So do novice and expert human users in a particular problem domain. We’ll explore how the tradeoffs between them change for different user populations.


### 11.4 Tradeoffs between CLI and Visual Interfaces
The CLI style of early Unix has retained its utility long after the demise of teletypes for two reasons. One is that command-line and command-language interfaces are more expressive than visual interfaces, especially for complex tasks. The other is that CLI interfaces are highly scriptable—they readily support the combining of programs, as we discussed in detail in Chapter 7. Usually (though not always) CLIs have an advantage in concision as well.

The disadvantage of the CLI style, of course, is that it almost always has high mnemonic load (low ease), and usually has low transparency. Most people (especially non-technical end users) find such interfaces relatively cryptic and difficult to learn.

On the other hand, the ’user-friendly’ GUIs of other operating systems have their own problems. Finding the right buttons to push is like playing Adventure: the interfaces are just as burdensome as any Unix command line interface, save that one can in theory find the treasure by sufficient exploration. In Unix, one needs the manual.

—Brian Kernighan

Database queries are a good example of the kind of interface for which pushing buttons is not just burdensome but extremely limiting. Neither keystroke commands to a full-screen character interface nor GUI gestures on a graphic display can express typical actions in the problem domain as expressively or concisely as typing SQL direct to a server. And it is certainly easier to make a client program utter SQL queries than it would be to have it simulate a user clicking a GUI!

On the other hand, many non-technical database users are so resistant to having to remember SQL syntax that they prefer a less concise and less expressive full-screen or GUI interface.

SQL is a good example for illustrating another point. The most powerful CLIs are not ad-hoc collections of commands, but imperative minilanguages designed along the lines we described in Chapter 8. These minilanguages are the highest-power, highest-complexity end of the CLI spectrum; they maximize expressiveness, but minimize ease. They are difficult to use and generally need to be discreetly veiled from ordinary end-users, but unbeatable when the capability and flexibility of the interface is the most important thing. When properly designed, they also score high on scriptability.

Some applications, unlike database queries, are naturally visual. Paint programs, Web browsers, and presentation software make three excellent examples. What these application domains have in common is that (a) transparency is extremely valuable, and (b) the primitive actions in the problem domain are themselves visual: “draw this”, “show me what I’m pointing at”, “put this here”.

The flip side of paint programs is that it is difficult to capture relationships within the pictures they are manipulating. It takes careful, thoughtful design to give the user any handle on the structure of images with repeated elements, for example. This is a general design problem with visual interfaces.

In Chapter 6 we looked at the Audacity sound file editor. Its interface design succeeds because it does a particularly clean job of mapping its audio application domain onto a simple set of visual representations (borrowed from equalizer displays on stereos). It does this by thoroughly following through the consequences of a single translation: sounds to waveform images. The visual operations are not a mere grab-bag of low-level tweaks; they are all tied to that translation.

In applications that are not naturally visual, however, visual interfaces are most appropriate for simple one-shot or infrequent tasks performed by novice users (a point the database example illustrates).

Resistance to CLI interfaces tends to decrease as users become more expert. In many problem domains, users (especially frequent users) reach a crossover point at which the concision and expressiveness of CLI becomes more valuable than avoiding its mnemonic load. Thus, for example, computing novices prefer the ease of GUI desktops, but experienced users often gradually discover that they prefer typing commands to a shell.

CLIs also tend to gain utility as problems scale up and involve more in the way of canned, procedural and repetitive actions. Thus, for example, a WYSIWYG desktop-publishing program is usually the easiest route to composing relatively small and unstructured documents such as business letters. But for complex book-sized documents that are assembled from sections and may require many global format changes or structural manipulation during composition, a minilanguage formatter such as troff, Tex, or some XML-markup processor is usually a more effective choice (see Chapter 18 for more discussion of this tradeoff).

Even in domains that are naturally visual, scaling up the problem size tends to tilt the tradeoff toward a CLI. If you need to fetch and save one Web page from a given URL, point and click (or type and click) is fine. But for Web forms, you’re going to use a keyboard. And if you need to fetch and save the pages corresponding to a given list of fifty URLs, a CLI client that can read URLs from standard input or the command line can save you a lot of unnecessary motion.

As another example, consider modifying the color table in a graphic image. If you want to change one color (say, to lighten it by an amount you will only know is right when you see it) a visual dialogue with a color-picker widget is almost mandatory. But suppose you need to replace the entire table with a set of specified RGB values, or to create and index large numbers of thumbnails. These are operations that GUIs usually lack the expressive power to specify. Even when they do, invoking a properly designed CLI or filter program will do the job far more concisely.

Finally (as we observed earlier on) CLIs are important in facilitating using programs from other programs. A GUI graphics editor that can handle making a batch of thumbnails for a list of files probably does it with a plugin written in a scripting language, calling an internal CLI of the graphics editor (as in the GIMP’s script-fu facility). Unix environments bring the value of CLIs into sharper relief precisely because their IPC facilities are rich, have low overhead, and are easily accessible from user programs.

The explosion of interest in GUIs since 1984 has had the unfortunate effect of obscuring the virtues of CLIs. The design of consumer software, in particular, has become heavily skewed toward GUIs. While this is a good choice for the novice and casual users that constitute most of the consumer market, it also exacts hidden costs on more expert users as they run up against the expressiveness limits of GUIs—costs which steadily increase as the users take on more demanding problems. Most of these costs derive from the fact that GUIs are simply not scriptable at all—every interaction with them has to be human-driven.

Gentner & Nielsen sum up the tradeoff very well in The Anti-Mac Interface [Gentner-Nielsen]: “[Visual interfaces] work well for simple actions with a small number of objects, but as the number of actions or objects increases, direct manipulation quickly becomes repetitive drudgery. The dark side of a direct manipulation interface is that you have to manipulate everything. Instead of an executive who gives high-level instructions, the user is reduced to an assembly-line worker who must carry out the same task over and over”. Noted science-fiction writer Neal Stephenson made the same point, less directly but more entertainingly, in his brilliant and discursive essay In the Beginning Was the Command Line [Stephenson].

A typical Unix old hand’s take on this problem is rather less theoretical:

The commercial world generally goes for the novice mode because (a) purchase decisions are often made on the basis of 30 seconds trial, and (b) it minimizes the demands on customer support to have only a dumbed-down GUI. I find many non-Unix systems very frustrating because, for example, they will provide no way to do something on a hundred or a thousand files; I want to write a script, and there’s no support for it. The basic problem is that they’ve assumed all users are novices all the time, and then they bash Unix because it doesn’t cater to that model.

—Mike Lesk

For the long haul, then—for serving both casual and expert users, for cooperating with other computer programs, and whether the problem domain is naturally visual or not—support for both CLI and visual interfaces is important. Unix’s history positions it well to meet both sets of needs. After presenting an indicative case study, we will examine the characteristic design patterns that the Unix tradition has evolved to meet them.


#### 11.4.1 Case Study: Two Ways to Write a Calculator Program
To be more concrete, let us contrast how the GUI and CLI styles can be usefully applied to the design of a simple interactive program: a desk calculator. Our examples for contrast are dc(1)/bc(1) and xcalc(1).

The original Unix desk calculator program, first distributed with Version 7, was dc(1)—a reverse-Polish-notation calculator that could handle unlimited-precision arithmetic. Later, an algebraic (infix notation) calculator language, bc(1), was implemented on top of dc (we used the relationship between these programs as a case study in Chapter 7, and again in Chapter 8). Both of these programs use a CLI. You type an expression on standard input, you press enter, and the value of the expression is printed on standard output.

The xcalc(1) program, on the other hand, visually simulates a simple calculator, with clickable buttons and a calculator-style display.


Figure 11.1. The xcalc GUI.

image

The xcalc(1) approach is simpler to describe because it mimics an interface with which novice users will be familiar; the man page says, in fact, “The numbered keys, the +/– key, and the +, –, *, /, and = keys all do exactly what you would expect them to”. All the capabilities of the program are conveyed by the visible button labels. This is the Rule of Least Surprise in its strongest form, and a real advantage for infrequent and novice users who will never have to read a man page to use the program.

However, xcalc also inherits the almost complete non-transparency of a calculator; when evaluating a complex expression, you don’t get to see and sanity-check your keystrokes—which can be a problem if, say, you misplace a decimal point in an expression like (2.51 + 4.6) * 0.3. There’s no history, so you can’t check. You’ll get a result, but it won’t be the result of the calculation you intended.

With the dc(1) and bc(1) programs, on the other hand, you can edit mistakes out of the expression as you build it. Their interface is more transparent, because you can see the calculation that is being performed at every stage. It is more expressive because the dc/bc interpreter, not being limited to what fits on a reasonably-sized visual mockup of a calculator, can include a much larger repertoire of functions (and facilities such as if/then/else, stored variables, and iteration). It also incurs, of course, a higher mnemonic load.

Concision is more of a toss-up; good typists will find the CLI more concise, while poor ones may find it faster to point and click. Scriptability is not a toss-up; dc/bc can easily be used as a filter, but xcalc can’t be scripted at all.

The tradeoff between ease for novices and utility for expert users is very clear here. For casual use in situations where a mental-arithmetic error check is not hard, xcalc wins. For more complex calculations where the steps must not only be correct but must be seen to be correct, or in which they are most conveniently generated by another program, dc/bc wins.


### 11.5 Transparency, Expressiveness, and Configurability
Unix programmers inherit a strong bias toward making interfaces expressive and configurable. Like programmers from other traditions, they think about how to match their interfaces to the target audience—but they differ in how they deal with uncertainty about that target audience. Software developers whose experience is primarily with client operating systems default toward making interfaces simple; they are willing to sacrifice expressiveness to gain ease. Unix programmers default toward making interfaces expressive and transparent, and are more willing to sacrifice ease to get these qualities.

The results of this attitude have often been described as interfaces written “by programmers, for programmers”. But this oversimplifies the matter in an important way. When a Unix programmer opts for configurability and expressiveness over ease, he is not necessarily thinking of his audience as consisting solely of other programmers; rather, he is often acting on a gut-level instinct that in the absence of knowledge about end-users’ intentions it is best not to patronize or second-guess them.

The downside of this attitude (which is a close cousin to “mechanism, not policy”) is a tendency to assume that when the highly configurable and expressive interface is done, the job is finished... even if the result is almost impossible for anyone else to use without lengthy study. The flip side of configurability is an urgent need for good defaults and an easy way to set everything to the default. The flip side of expressivity is a need for guidance—be it in the program or the documentation—on where to get started and how to achieve the most commonly-desired results.

—Henry Spencer

The Rule of Transparency also has an influence. When a Unix programmer is writing to meet an RFC or other standard that defines a set of control options, he tends to assume that his job is to provide a complete and transparent interface to all of those options; whether or not he thinks any given one will actually be used is secondary. His job is mechanism; policy belongs to the user.

This mindset leads to a much stricter attitude about what constitutes standards conformance, one in which incomplete support is much less tolerable. In cases where a Macintosh or Windows developer would say “We don’t need to support that feature of the standard; most users won’t care, and it’s too complicated for them”, a Unix developer is likely to say “We don’t know that nobody will ever want this feature or option, therefore we must support it”.

These attitudes can lead to clashes when a Unix programmer is working with others, who are likely to interpret his design choices as a blithe willingness to burden users with technical details that are obscure, pointless, and even frightening. Mac or Windows programmers fear scaring away the many to serve the advanced needs of the few.

The Unix programmer, on the other hand, is likely to see defaulting away from expressiveness as a sort of cop-out or even betrayal of future users, who will know their own requirements better than the present implementer. Ironically, though the Unix attitude is often construed as a sort of programmer arrogance, it is actually a form of humility—one often acquired along with years of battle scars.

The extent to which the Unix attitude is appropriate varies. Whichever side of this divide you the reader are on, it is wise to learn to listen to the other, and wise to understand the premises behind the opposing point of view. Rather than falling into the trap of either intimidating users or condescending to them, it may be possible to build transparent interfaces in which the advanced features are present but inconspicuous. The audacity and kmail case studies in Chapter 6 are good examples to follow.

Finally, a note about user-interface design for nontechnical end-users. This is a demanding art, and Unix programmers don’t have a tradition of being very good at it. But with the ideas we’ve developed from examining the Unix tradition, it is possible to make one strong and useful statement about it. That is: when people say a user interface is intuitive, what they mean is that it (a) is discoverable, (b) is transparent in use, and (c) obeys the Rule of Least Surprise.2 Of these three rules, Least Surprise is the least binding; initial surprises can be coped with if discoverability and transparency make longer-term use rewarding.

2 This insight comes to us from a nontechnical end-user who just happens to be the author’s wife Catherine Raymond.

The user interfaces of today’s cellphones (for example) have relatively high mnemonic load in that you have to maintain at least a rough mental map of the interface menus to use them rapidly without constantly having to spend attention on checking where you are in the hierarchy. But the better-designed ones rapidly become ’intuitive’ for their users anyway, because they have these three qualities.

Intuitiveness is not quite the same quality as ease, because (as the cellphone example shows) people can develop what they think of as ’intuitions’ about transparent interfaces that have fairly high mnemonic load, as long as simple operations are easy and there is a discovery path that allows them to assimilate the interface’s more difficult corners one step at a time.


### 11.6 Unix Interface Design Patterns
In the Unix tradition, the tradeoffs we described above are met by well-established interface design patterns. Here is a bestiary of these patterns, with analyses and examples. We’ll follow it with a discussion of how to apply them.

Note that this bestiary does not include GUI design patterns (though it includes a design pattern that can use a GUI as a component). There are no design patterns in graphical user interfaces themselves that are specifically native to Unix. A promising beginning of a discussion of GUI design patterns in general can be found at Experiences—A Pattern Language for User Interface Design [Coram-Lee].

Also note that programs may have modes that fit more than one interface pattern. A program that has a compiler-like interface, for example, may behave as a filter when no file arguments are specified on the command line (many format converters behave like this).


#### 11.6.1 The Filter Pattern
The interface-design pattern most classically associated with Unix is the filter. A filter program takes data on standard input, transforms it in some fashion, and sends the result to standard output. Filters are not interactive; they may query their startup environment, and are typically controlled by command-line options, but they do not require feedback or commands from the user in their input stream.

Two classic examples of filters are tr(1) and grep(1). The tr(1) program is a utility that translates data on standard input to results on standard output using a translation specification given on the command line. The grep(1) program selects lines from standard input according to a match expression specified on the command line; the resulting selected lines go to standard output. A third is the sort(1) utility, which sorts lines in input according to criteria specified on the command line and issues the sorted result to standard output.

Both grep(1) and sort(1) (but not tr(1)) can alternatively take data input from a file (or files) named on the command line, in which case they do not read standard input but act instead as though that input were the catenation of the named files read in the order they appear. (In this case it is also expected that specifying “-” as a filename on the command line will direct the program explicitly to read from standard input.) The archetype of such ’catlike’ filters is cat(1), and filters are expected to behave this way unless there are application-specific reasons to treat files named on the command line differently.

When designing filters, it is well to bear in mind some additional rules, partly developed in Chapter 1:

Remember Postel’s Prescription: Be generous in what you accept, rigorous in what you emit. That is, try to accept as loose and sloppy an input format as you can and emit as well-structured and tight an output format as you can. Doing the former reduces the odds that the filter will be brittle in the face of unexpected inputs, and break in someone’s hand (or in the middle of someone’s toolchain). Doing the latter increases the odds that your filter will someday be useful as an input to other programs.
When filtering, never throw away information you don’t need to. This, too, increases the odds that your filter will someday be useful as an input to other programs. Information you discard is information that no later stage in a pipeline can use.
When filtering, never add noise. Avoid adding nonessential information, and avoid reformatting in ways that might make the output more difficult for downstream programs to parse. The most common offenders are cosmetic touches like headers, footers, blank/ruler lines, summaries and conversions like adding aligned columns, or writing a factor of “1.5” as “150%”. Times and dates are a particular bother because they’re hard for downstream programs to parse. Any such additions should be optional and controlled by switches. If your program emits dates, it’s good practice to have a switch that can force them into ISO8601 YYYY-MM-DD and hh:mm:ss formats—or, better yet, use those by default.
The term “filter” for this pattern is long-established Unix jargon.

“Filter” is indeed long-established. It came into use on day one of pipes. The term was a natural transferral from electrical-engineering usage: data flowed from source through filters to sink. Source or sink could be either process or file. The collective EE term, “circuit”, was never considered, since the plumbing metaphor for data flow was already well established.

—Doug McIlroy

Some programs have interface design patterns like the filter, but even simpler (and, importantly, even easier to script). They are cantrips, sources, and sinks.


#### 11.6.2 The Cantrip Pattern
The cantrip interface design pattern is the simplest of all. No input, no output, just an invocation and a numeric exit status. A cantrip’s behavior is controlled only by startup conditions. Programs don’t get any more scriptable than this.

Thus, the cantrip design pattern is an excellent default when the program doesn’t require any runtime interaction with the user other than fairly simple setup of initial conditions or control information.

Indeed, because scriptability is important, Unix designers learn to resist the temptation to write more interactive programs when cantrips will do. A collection of cantrips can always be driven from an interactive wrapper or shell program, but interactive programs are harder to script. Good style therefore demands that you try to find a cantrip design for your tool before giving in to the temptation to write an interactive interface that will be harder to script. And when interactivity seems necessary, remember the characteristic Unix design pattern of separating the engine from the interface; often, the right thing is an interactive wrapper written in some scripting language that calls a cantrip to do the real work.

The console utility clear(1), which simply clears your screen, is the purest possible cantrip; it doesn’t even take command-line options. Other classic simple examples are rm(1) and touch(1). The startx(1) program used to launch X is a complex example, typical of a whole class of daemon-summoning cantrips.

This interface design pattern, though fairly common, has not traditionally been named; the term “cantrip” is my invention. (In origin, it’s a Scots-dialect word for a magic spell, which has been picked up by a popular fantasy-role-playing game to tag a spell that can be cast instantly, with minimal or no preparation.)


#### 11.6.3 The Source Pattern
A source is a filter-like program that requires no input; its output is controlleld only by startup conditions. The paradigmatic example would be ls(1), the Unix directory lister. Other classic examples include who(1) and ps(1).

Under Unix, report generators like ls(1), ps(1), and who(1) tend strongly to obey the source pattern, so their output can be filtered with standard tools.

The term ’source’ is, as Doug McIlroy noted, very traditional. It is less common than it might be because ’source’ has other important meanings.


#### 11.6.4 The Sink Pattern
A sink is a filter-like program that consumes standard input but emits nothing to standard output. Again, its actions on the input data are controlled only by startup conditions.

This interface pattern is unusual, and there are few well-known examples. One is lpr(1), the Unix print spooler. It will queue text passed to it on standard input for printing. Like many sink programs, it will also process files named to it on the command line. Another example is mail(1) in its mail-sending mode.

Many programs that might appear at first glance to be sinks take control information as well as data on standard input and are actually instances of something like the ed pattern (see below).

The term sponge is sometimes applied specifically to sink programs like sort(1) that must read their entire input before they can process any of it.

The term ’sink’ is traditional and common.


#### 11.6.5 The Compiler Pattern
Compiler-like programs use neither standard output nor standard input; they may issue error messages to standard error, however. Instead, a compiler-like program takes file or resource names from the command line, transforms the names of those resources in some way, and emits output under the transformed names. Like cantrips, compiler-like programs do not require user interaction after startup time.

This pattern is so named because its paradigm is the C compiler, cc(1) (or, under Linux and many other modern Unixes, gcc(1)). But it is also widely used for programs that do (for example) graphics file conversions or compression/decompression.

A good example of the former is the gif2png(1) program used to convert GIF (Graphic Interchange Format) to PNG (Portable Network Graphics).3 Good examples of the latter are the gzip(1) and gunzip(1) GNU compression utilities, almost certainly shipped with your Unix system.

3 Sources for this program, and other converters with similar interfaces, are available at the PNG website <http://www.cdrom.com/pub/png/>.

In general, the compiler interface design pattern is a good model when your program often needs to operate on multiple named resources and can be written to have low interactivity (with its control information supplied at startup time). Compiler-like programs are readily scriptable.

The term “compiler-like interface” for this pattern is well-understood in the Unix community.


#### 11.6.6 The ed pattern
All the previous patterns have very low interactivity; they use only control information passed in at startup time, and separate from the data. Many programs, of course, need to be driven by a continuing dialog with the user after startup time.

In the Unix tradition, the simplest interactive design pattern is exemplified by ed(1), the Unix line editor. Other classic examples of this pattern include ftp(1) and sh(1), the Unix shell. The ed(1) program takes a filename argument; it modifies that file. On its input, it accepts command lines. Some of the commands result in output to standard output, which is intended to be seen immediately by the user as part of the dialog with the program.

An actual sample ed(1) session will be included in Chapter 13.

Many browserlike and editorlike programs under Unix obey this pattern, even when the named resource they edit is something other than a text file. Consider gdb(1), the GNU symbolic debugger, as an example.

Programs obeying the ed interface design pattern are not quite so scriptable as would be the simpler interface types resembling filters. You can feed them commands on standard input, but it is trickier to generate sequences of commands (and interpret any output they might ship back) than it is to just set environment variables and command-line options. If the action of the commands is not so predictable that they can be run blind (e.g., with a here-document as input and ignoring output), driving ed-like programs requires a protocol, and a corresponding state machine in the calling process. This raises the problems we noted in Chapter 7 during the discussion of slave process control.

Nevertheless, this is the simplest and most scriptable pattern that supports fully interactive programs. Accordingly, it is still quite useful as a component of the “separated engine and interface” pattern we’ll describe below.


#### 11.6.7 The Roguelike Pattern
The roguelike pattern is so named because its first example was the dungeon-crawling game rogue(1) (see Figure 11.2) under BSD; the adjective “roguelike” for this pattern is widely recognized in Unix tradition. Roguelike programs are designed to be run on a system console, an X terminal emulator, or a video display terminal. They use the full screen and support a visual interface style, but with character-cell display rather than graphics and a mouse.


Figure 11.2. Screen shot of the original Rogue game.

image

Commands are typically single keystrokes not echoed to the user (as opposed to the command lines of the ed pattern), though some will open a command window (often, though not always, the last line of the screen) on which more elaborate invocations can be typed. The command architecture often makes heavy use of the arrow keys to select screen locations or lines on which to operate.

Programs written in this pattern tend to model themselves on either vi(1) or emacs(1) and (obeying the Rule of Least Surprise) use their command sequences for common operations such as getting help or terminating the program. Thus, for example, one can expect one of the commands ’x’, ’q’, or ’C-x C-c’ to terminate a program written to this pattern.

Some other interface tropes associated with this pattern include: (a) the use of one-item-per-line menus, with the currently-selected item indicated by bold or reverse-video highlighting, and (b) ’mode lines’—program status summaries carried on a highlighted screen line, often near the bottom or at the top of the screen.

The roguelike pattern evolved in a world of video display terminals; many of these didn’t have arrow or function keys. In a world of graphics-capable personal computers, with character-cell terminals a fading memory, it’s easy to forget what an influence this pattern exerted on design; but the early exemplars of the roguelike pattern were designed a few years before IBM standardized the PC keyboard in 1981. As a result, a traditional but now archaic part of the roguelike pattern is the use of the h, j, k, and l as cursor keys whenever they are not being interpreted as self-inserting characters in an edit window; invariably k is up, j is down, h is left, and l is right. This history also explains why older Unix programs tend not to use the ALT keys and to use function keys in a limited way if at all.

Programs obeying this pattern are legion: The vi(1) text editor in all its variants, and the emacs(1) editor; elm(1), pine(1), mutt(1), and most other Unix mail readers; tin(1), slrn(1), and other Usenet newsreaders; the lynx(1) Web browser; and many others. Most Unix programmers spend most of their time driving programs with interfaces like these.

The roguelike pattern is hard to script; indeed scripting it is seldom even attempted. Among other things, this pattern uses raw-mode character-by-character input, which is inconvenient for scripting. It’s also quite hard to interpret the output programmatically, because it usually consists of sequences of incremental screen-painting actions.

Nor does this pattern have the visual slickness of a mouse-driven full GUI. While the point of using the full screen interface is to support simple kinds of direct-manipulation and menu interfaces, roguelike programs still require users to learn a command repertoire. Indeed, interfaces built on the roguelike pattern show a tendency to degenerate into a sort of cluttered wilderness of modes and meta-shift-cokebottle commands that only hard-core hackers can love. It would seem that this pattern has the worst of both worlds, being neither scriptable nor conforming to recent fashions in design for end-users.

But there must be some value in this pattern. Roguelike mailers, newsreaders, editors, and other programs remain extremely popular even among people who invariably run them through terminal emulators on an X display that supports GUI competitors. Moreover, the roguelike pattern is so pervasive that under Unix even GUI programs often emulate it, adding mouse and graphics support to a command and display interface that still looks rather roguelike. The X mode of emacs(1), and the xchat(1) client are good examples of such adaptation. What accounts for the pattern’s continuing popularity?

Efficiency, and perceived efficiency, seem to be important factors. Roguelike programs tend to be fast and lightweight relative to their nearest GUI competitors. For startup and runtime speed, running a roguelike program in an Xterm may be preferable to invoking a GUI that will chew up substantial resources setting up its displays and respond more slowly afterwards. Also, programs with a roguelike design pattern can be used over telnet links or low-speed dialup lines for which X is not an option.

Touch-typists often prefer roguelike programs because they can avoid taking their hands off the keyboard to move a mouse. Given a choice, touch-typists will prefer interfaces that minimize keystrokes far off the home row; this may account for a significant percentage of vi(1)’s popularity.

Perhaps more importantly, roguelike interfaces are predictable and sparing in their use of screen real estate on an X display; they do not clutter the display with multiple windows, frame widgets, dialog boxes, or other GUI impedimenta. This makes the pattern well suited for use in programs that must frequently share the user’s attention with other programs (as is especially the case with editors, mailers, newsreaders, chat clients, and other communication programs).

Finally (and probably most importantly) the roguelike pattern tends to appeal more than GUIs to people who value the concision and expressiveness of a command set enough to tolerate the added mnemonic load. We saw above that there are good reasons for this preference to become more common as task complexity, use frequency, and user experience rise. The roguelike pattern meets this preference while also supporting GUI-like elements of direct manipulation as an ed-pattern program cannot. Thus, far from having only the worst of both worlds, the roguelike interface design pattern can capture some of the best.


#### 11.6.8 The ’Separated Engine and Interface’ Pattern
In Chapter 7 we argued against building monster single-process monoliths, and that it is often possible to lower the global complexity of programs by splitting them into communicating pieces. In the Unix world, this tactic is frequently applied by separating the ’engine’ part of the program (core algorithms and logic specific to its application domain) from the ’interface’ part (which accepts user commands, displays results, and may provide services such as interactive help or command history). In fact, this separated-engine-and-interface pattern is probably the one most characteristic interface design pattern of Unix.

(The other, more obvious candidate for that distinction would be filters. But filters are more often found in non-Unix environments than engine/interface pairs with bidirectional traffic between them. Simulating pipelines is easy; the more sophisticated IPC mechanisms required for engine/interface pairs are hard.)

Owen Taylor, maintainer of the GTK+ library widely used for writing user interfaces under X, beautifully brings out the engineering benefits of this kind of partitioning at the end of his note Why GTK_MODULES is not a security hole <http://www.gtk.org/setuid.html>; he finishes by writing “[T]he secure setuid program is a 500 line program that does only what it needs to, rather than a 500,000 line library whose essential task is user interfaces”.

This is not a new idea. Xerox PARC’s early research into graphical user interfaces led them to propose the “model-view-controller” pattern as an archetype for GUIs.

• The “model” is what in the Unix world is usually called an “engine”. The model contains the domain-specific data structures and logic for your application. Database servers are archetypal examples of models.

• The “view” part is what renders your domain objects into a visible form. In a really well-separated model/view/controller application, the view component is notified of updates to the model and responds on its own, rather than being driven synchronously by the controller or by explicit requests for a refresh.

• The “controller” processes user requests and passes them as commands to the model.

In practice, the view and controller parts tend to be more closely bound together than either is to the model. Most GUIs, for example, combine view and controller behavior. They tend to be separated only when the application demands multiple views of the model.

Under Unix, application of the model/view/controller pattern is far more common than elsewhere precisely because there is a strong “do one thing well” tradition, and IPC methods are both easy and flexible.

An especially powerful form of this technique couples a policy interface (often a GUI combining view and controller functions) with an engine (model) that contains an interpreter for a domain-specific minilanguage. We examined this pattern in Chapter 8, focusing on minilanguage design; now it’s time to look at the different ways that such engines can form components of larger systems of code.

There are several major variants of this pattern.


#### 11.6.8.1 Configurator/Actor Pair
In a configurator/actor pair, the interface part controls the startup environment of a filter or daemon-like program which then runs without requiring user commands.

The programs fetchmail(1) and fetchmailconf(1) (which we’ve already used as case studies in discoverability and data-driven programming and will encounter again as language case studies in Chapter 14) are a good example of a configurator/actor pair. fetchmailconf is the interactive dotfile configurator that ships with fetchmail. fetchmailconf can also serve as a GUI wrapper that runs fetchmail in either foreground or background mode.

This design pattern enables both fetchmail and fetchmailconf to specialize in what they do well, and indeed to be written in different languages appropriate to their task domains. Fetchmail, which usually runs in background as a daemon, need not be bloated with GUI code. Conversely, fetchmailconf can specialize in elaborate GUIness without exacting size and complexity costs from fetchmail. Finally, because the information channels between them are narrow and well-defined, it remains possible to drive fetchmail from the command line and from scripts other than fetchmailconf.

The term “configurator/actor” is my invention.


#### 11.6.8.2 Spooler/Daemon Pair
A slight variant of the configurator/actor pair can be useful in situations that require serialized access to a shared resource in a batch mode; that is, when a well-defined job stream or sequence of requests requires some shared resource, but no individual job requires user interaction.

In this spooler/daemon pattern, the spooler or front end simply drops job requests and data in a spool area. The job requests and data are simply files; the spool area is typically just a directory. The location of the directory and the format of the job requests are agreed on by the spooler and daemon.

The daemon runs forever in background, polling the spool directory, looking there for work to do. When it finds a job request, it tries to process the associated data. If it succeeds, the job request and data are deleted out of the spool area.

The classic example of this pattern is the Unix print spooler system, lpr(1)/lpd(1). The front end is lpr(1); it simply drops files to be printed in a spool area periodically scanned by lpd. lpd’s job is simply to serialize access to the printer devices.

Another classic example is the pair at(1)/atd(1), which schedules commands for execution at specified times. A third example, historically important though no longer in wide use, was UUCP—the Unix-to-Unix Copy Program commonly used as a mail transport over dial-up lines before the Internet explosion of the early 1990s.

The spooler/daemon pattern remains important in mail-transport programs (which are batchy by nature). The front ends of mail transports such as sendmail(1) and qmail(1) usually make one try at delivering mail immediately, through SMTP over an outbound Internet connection. If that attempt fails, the mail will fall into a spool area; a daemon version or mode of the mail transport will retry the delivery later.

Typically, a spooler/daemon system has four parts: a job launcher, a queue lister, a job-cancellation utility, and a spooling daemon, In fact, the presence of the first three parts is a sure clue that there is a spooler daemon behind them somewhere.

The terms “spooler” and “daemon” are well-established Unix jargon. (’Spooler’ actually dates back to early mainframe days.)


#### 11.6.8.3 Driver/Engine Pair
In this pattern, unlike a configurator/actor or spooler/server pair, the interface part supplies commands to and interprets output from an engine after startup; the engine has a simpler interface pattern. The IPC method used is an implementation detail; the engine may be a slave process of the driver (in the sense we discussed in Chapter 7) or the engine and driver may communicate through sockets, or shared memory, or any other IPC method. The key points are (a) the interactivity of the pair, and (b) the ability of the engine to run standalone with its own interface.

Such pairs are trickier to write than configurator/actor pairs because they are more tightly and intricately coupled; the driver must have knowledge not merely about the engine’s expected startup environment but about its command set and response formats as well.

When the engine has been designed for scriptability, however, it is not uncommon for the driver part to be written by someone other than the engine author, or for more than one driver to front-end a given engine. An excellent example of both is provided by the programs gv(1) and ghostview(1), which are drivers for gs(1), the Ghostscript interpreter. GhostScript renders PostScript to various graphics formats and lower-level printer-control languages. The gv and ghostview programs provide GUI wrappers for GhostScript’s rather idiosyncratic invocation switches and command syntax.

Another excellent example of this pattern is the xcdroast/cdrtools combination. The cdrtools distribution provides a program cdrecord(1) with a command-line interface. The cdrecord code specializes in knowing everything about talking to CD-ROM hardware. xcdroast is a GUI; it specializes in providing a pleasant user experience. The xcdroast(1) program calls cdrecord(1) to do most of its work.


Figure 11.3. The Xcdroast GUI.

image

xcdroast also calls other CLI tools: cdda2wav(1) (a sound file converter) and mkisofs(1) (a tool for creating ISO-9660 CD-ROM file system images from a list of files). The details of how these tools are invoked are hidden from the user, who can think in terms centered on the task of making CDs rather than having to know directly about the arcana of sound-file conversion or file-system structure. Equally important, the implementers of each of these tools can concentrate on their domain-specific expertise without having to be user-interface experts.

A key pitfall of driver/engine organization is that frequently the driver must understand the state of the engine in order to reflect it to the user. If the engine action is practically instantaneous, it’s not a problem, but if the engine can take a long time (e.g., when accessing many URLs) the lack of feedback can be a significant issue. A similar problem is responding to errors. For example, the traditional (although not very Unix-like) confirmation question about whether it’s OK to overwrite a file that already exists is kind of painful to write in the driver/engine world; the engine, which detects the problem, has to ask the driver to do the confirmation prompting.

—Steve Johnson

It’s important to design the engine so that it not only does the right thing, but also notifies the driver about what it’s doing so the driver can present a graceful interface with appropriate feedback.

The terms “driver” and “engine” are uncommon but established in the Unix community.


#### 11.6.8.4 Client/Server Pair
A client/server pair is like a driver/engine pair, except that the engine part is a daemon running in background which is not expected to be run interactively, and does not have its own user interface. Usually, the daemon is designed to mediate access to some sort of shared resource—a database, or a transaction stream, or specialized shared hardware such as a sound device. Another reason for such a daemon may be to avoid performing expensive startup actions each time the program is invoked.

Yesterday’s paradigmatic example was the ftp(1)/ftpd(1) pair that implements FTP, the File Transfer Protocol; or perhaps two instances of sendmail(1), sender in foreground and listener in background, passing Internet email. Today’s would have to be any browser/web server pair.

However, this pattern is not limited to communication programs; another important case is in databases, such as the psql(1)/postmaster(1) pair. In this one, psql serializes access to a shared database managed by the postgres daemon, passing it SQL requests and presenting data sent back as responses.

These examples illustrate an important property of such pairs, which is that the cleanliness of the protocol that serializes communication between them is all-important. If it is well-defined and described by an open standard, it can become a tremendous opportunity for leverage by insulating client programs from the details of how the server’s resource is managed, and allowing clients and servers to evolve semi-independently. All separated-engine-and-interface programs potentially get this kind of benefit from clean separation of function, but in the client/server case the payoffs for getting it right tend to be particularly high exactly because managing shared resources is intrinsically difficult.

Message queues and pairs of named pipes can be and have been used for front-end/back-end communication, but the benefits of being able to run the server on a different machine from the client are so great that nowadays almost all modern client-server pairs use TCP/IP sockets.


#### 11.6.9 The CLI Server Pattern
It’s normal in the Unix world for server processes to be invoked by harness programs4 such as inetd(8) in such a way that the server sees commands on standard input and ships responses to standard output; the harness program then takes care of ensuring that the server’s stdin and stdout are connected to a specified TCP/IP service port. One benefit of this division of labor is that the harness program can act as a single security gatekeeper for all of the servers it launches.

4 A harness program is a wrapper whose job it is to make some special sort of resource available to the program(s) it calls. The term is most often used for test harnesses, which make available test loads and (often) examples of correct output for the actual output to be checked against.

One of the classic interface patterns is therefore a CLI server. This is a program which, when invoked in a foreground mode, has a simple CLI interface reading from standard input and writing to standard output. When backgrounded, the server detects this and connects its standard input and standard output to a specified TCP/IP service port.

In some variants of this pattern, the server backgrounds itself by default, and has to be told with a command-line switch when it should stay in foreground. This is a detail; the essential point is that most of the code neither knows nor cares whether it is running in foreground or a TCP/IP harness.

POP, IMAP, SMTP, and HTTP servers normally obey this pattern. It can be combined with any of the server/client patterns described earlier in this chapter. An HTTP server can also act as a harness program; the CGI scripts that supply most live content on the Web run in a special environment provided by the server where they can take input (form arguments) from standard input, and write the generated HTML that is their result to standard output.

Though this pattern is quite traditional, the term “CLI server” is my invention.


#### 11.6.10 Language-Based Interface Patterns
In Chapter 8 we examined domain-specific minilanguages as a means of pushing program specification up a level, gaining flexibility, and minimizing bugs. These virtues make the language-based CLI an important style of Unix interface—one exemplified by the Unix shell itself.

The strengths of this pattern are well illustrated by the case study earlier in the chapter comparing dc(1)/bc(1) with xcalc(1). The advantages that we observed earlier (the gain in expressiveness and scriptability) are typical of minilanguages; they generalize to other situations in which you routinely have to sequence complex operations in a specialized problem domain. Often, unlike the calculator case, minilanguages also have a clear advantage in concision.

One of the most potent Unix design patterns is the combination of a GUI front end with a CLI minilanguage back end. Well-designed examples of this type are necessarily rather complex, but often a great deal simpler and more flexible than the amount of ad-hoc code that would be necessary to cover even a fraction of what the minilanguage can do.

This general pattern is not, of course, unique to Unix. Modern database suites everywhere normally consist of one or more GUI front ends and report generators, all of which talk to a common back-end using a query language such as SQL. But this pattern mainly evolved under Unix and is still much better understood and more widely applied there than elsewhere.

When the front and back ends of a system fulfilling this design pattern are combined in a single program, that program is often said to have an ’embedded scripting language’. In the Unix world, Emacs is one of the best-known exemplars of this pattern; refer to our discussion of it in Chapter 8 for some advantages.

The script-fu facility of GIMP is another good example. GIMP is a powerful open-source graphics editor. It has a GUI resembling that of Adobe Photoshop. Script-fu allows GIMP to be scripted using Scheme (a dialect of Lisp); scripting through Tcl, or Perl or Python is also available. Programs written in any of these languages can call GIMP internals through its plugin interface. The demonstration application for this facility is a Web page5 which allows people to construct simple logos and graphic buttons through a CGI interface that passes a generated Scheme program to an instance of GIMP, and returns a finished image.

5 Script-Fu page <http://www.xcf.berkeley.edu/~gimp/script-fu/script-fu.html>.


### 11.7 Applying Unix Interface-Design Patterns
To facilitate scripting and pipelining (see Chapter 7) it is wise to choose the simplest interface pattern possible—that is, the pattern with the fewest channels to the environment and the least interactivity.

In many of the single-component patterns described above, it is emphasized that the pattern does not require user interaction after startup time. When the ’user’ is often expected to be another program (and thus to lack the range and flexibility of a human brain) this is a very valuable feature, maximizing scriptability.

We’ve seen that different interface design patterns optimize for traits valuable in differing circumstances. In particular, there is a strong and inherent tension between the GUIs and design patterns appropriate for novice and nontechnical end-users (on the one hand) and those which serve expert users and maximize scriptability (on the other).

One way around this dilemma is to make programs with modes that exhibit more than one pattern. An excellent example is the Web browser lynx(1). It normally has a roguelike interface for interactive use, but can be called with a -dump option that makes it into a source, formatting a specified Web page to text dumped on standard output.

Such dual-mode interfaces, however, are not normally attempted when the program has to have a true GUI. The reasons for this are partly historical, but mostly have to do with controlling global complexity. GUIs tend to require complex startup configurations and large volumes of specialized code; these features coexist uneasily with the simpler patterns. In the worst case, a dual-mode GUI/non-GUI program could require two separate command-interpreter loops, with all that implies in the way of code bloat and potential inconsistencies.

Thus, when “choose the simplest pattern” conflicts with a requirement to produce a GUI, the Unix way is to split the program in two, applying the ’separated engine and interface’ design pattern.

In fact, by combining a theme from Chapter 7 with this idea, we can perhaps name a new design pattern emerging under Linux and other modern, open-source Unixes where GUIs are not merely a reluctant add-on but an active focus of lots of development effort.


#### 11.7.1 The Polyvalent-Program Pattern
A polyvalent program has the following traits:

The program’s application-domain logic lives in a library with a documented API, which can be linked to other programs. The program’s interface logic to the rest of the world is a thin layer over the library. Or perhaps there are several layers with different UI styles, any of which the library can be linked to.
One UI mode is a cantrip, compiler-like or CLI pattern that executes its interactive commands in batch mode.
One UI mode is a GUI, either linked directly to the core library or acting as as a separate process driving the CLI interface.
One UI mode is a scripting interface using a modern general-purpose scripting language like Perl, Python, or Tcl.
Optional extra: One UI mode is a roguelike interface using curses(3).

Figure 11.4. Caller/callee relationships in a polyvalent program.

image

Notably, the GIMP actually fulfills this pattern.


### 11.8 The Web Browser as a Universal Front End
Separating your CLI back end from a GUI interface has become an even more attractive strategy since the transformation of computing by the World Wide Web in the mid-1990s. For a large class of applications, it makes increasing sense not to write a custom GUI front end at all, but rather to press Web browsers into service in that role.

This approach has many advantages. The most obvious is that you don’t have to write procedural GUI code—instead, you can describe the GUI you want in languages (HTML and JavaScript) that are specialized for it. This avoids a lot of expensive and complex single-purpose coding and often more than halves the total project effort. Another is that it makes your application instantly Internet-ready; the front end may be on the same host as the back end, or may be a thousand miles away. Yet another is that all the minor presentation details of the application (such as fonts and color) are no longer your back end’s problem, and indeed can be customized by users to their own tastes through mechanisms like browser preferences and cascading style sheets. Finally, the uniform elements of the Web interface substantially ease the user’s learning task.

There are disadvantages. The two most important are (a) the batch style of interaction that the Web enforces, and (b) the difficulties of managing persistent sessions using a stateless protocol. Though these are not exclusively Unix issues, we’ll discuss them here—because it’s very important to think clearly on the design level about when it’s worthwhile to accept or work around these constraints.

CGI, the Common Gateway Interface through which a browser can invoke a program on the server host, does not support fine-grained interactivity well. Nor do the templating systems, application servers, and embedded server scripts that are gradually replacing it (in a mild abuse of language, we will use CGI for all of these in this section).

You can’t do character-by-character or GUI-gesture-by-GUI-gesture I/O through a CGI gateway; instead, you have to fill out an HTML form and click a submit button that sends the form contents to a CGI script. The CGI script then runs and the server hands you back a page of HTML that it generated (which may itself be another CGI form).

This is essentially a batch style of interaction, not that far removed in concept from dropping punched cards in an input hopper and getting back a printout. It can be made more palatable by using JavaScript to interact with the user, batching up transactions into messages to be shipped to the server.

Java applets can open up their own character-stream connections back to the server to support smoother interactivivity. But Java has technical problems (it can only use a fixed display area on the page, and can’t change the portion of the display outside that rectangle) and much worse political ones (proprietary licensing from Sun has stalled Java deployment and made others reluctant to commit to it; you can’t count on every user’s browser to support it).

Both Java and JavaScript can run into browser incompatibilities, as well. Microsoft’s resistance to implementing JDK 1.2 and Swing on Internet Explorer is a serious problem for Java applets, and differing Javascript version levels can also break your application (though Javascript bugs are easier to fix). Nevertheless, it is frequently less effort to work around these problems than it would be to write and deploy a custom front end. A problem harder to work around is that a growing number of sophisticated users routinely disable Java and even JavaScript in their browsers because of security problems and interface abuses.

As an independent issue, it is tricky to maintain session information across multiple CGI forms. The server doesn’t keep any state about client sessions between CGI transactions, so you can’t rely on it to connect later form submissions with earlier ones by the same user. There are two standard dodges around this: chained forms and browser cookies.

When you chain forms, you arrange for the CGI for the first form to generate a unique ID in an invisible field of the second form, and for the second and all subsequent forms to pass that ID to their successors. Cookies give a similar effect in a less direct way analogous to environment variables (see any of the hundreds of books on CGI design for details). In either case, your CGI has to use the ID as a session index (or cookies to cache state directly) and to handle multiplexing the sessions explicitly.

It is often possible to live with these restrictions. Many nontrivial applications can fit into a single form and response, evading both problems. Even when this isn’t true and the application requires multiple forms, the complexity and cost savings from not having to build and distribute a specialized front end are so large that they can easily pay for the effort required to write CGIs smart enough to do their own session tracking.

The session management problem can be addressed with application servers like Zope or Enhydra which provide a session abstraction, and services like user authentication to programs embedded inside them. The drawback of these programs is identical to their advantage: the fact that they make it easier to keep per-user state on the server. That per-user state can be a problem; it eats resources, and it has to be timed out, because between transactions there is no way to know that the user is still on the other end of the wire.

As usual, the best advice is to choose the simplest pattern possible. Resist the temptation to do a heavyweight design relying on Java or an application server when simple CGIs and cookies will do the job.

One problem with the browser-as-universal-front-end approach is that CGI back ends aren’t readily separable from the browser environment, so it can be hard to script or automate transactions to the back end. The Unix answer is a three-tier architecture—Web forms calling CGIs which call commands. The automation interface is the commands.

The way that browsers decouple front and back ends has larger implications. On the Web, locking in consumers to closed, proprietary protocols and APIs has become more difficult and less attractive as this trend has advanced. The economics of software development are therefore tilting toward HTML, XML, and other open, text-based Internet standards. This trend synergizes in interesting ways with the evolution of the open-source development model, which we’ll survey in Chapter 19. In the world that the Web is creating, Unix’s design tradition—including the approaches to interface design we’ve surveyed in this chapter—looks more at home than ever before.


### 11.9 Silence Is Golden
We cannot leave the subject of interactive user interfaces without exploring one of the oldest and most persistent design tropes of Unix, the Rule of Silence. We observed in Chapter 1 that well-designed Unix programs with nothing interesting or surprising to say should shut up, and suggested there are good reasons for this that have long outlasted the slow teletypes on which Unix was born.

Here’s one: Programs that babble don’t tend to play well with other programs. If your CLI program emits status messages to standard output, then programs that try to interpret that output will be put to the trouble of interpreting or discarding those messages (even if nothing went wrong!). Better to send only real errors to standard error and not to emit unrequested data at all.

Here’s another: The user’s vertical screen space is precious. Every line of junk your program emits is one less line of context still available on the user’s display.

Here’s a third: Junk messages are a careless waste of the human user’s bandwidth. They’re one more source of distracting motion on a screen display that may be mediating for more important foreground tasks, such as communication with other humans.

Go ahead and give your GUIs progress bars for long operations. That’s good style—it helps the user time-share his brain efficiently by cuing him that he can go off and read mail or do other things while waiting for completion. But don’t clutter GUI interfaces with confirmation popups except when you have to guard operations that might lose or trash data—and even then, hide them when the parent window is minimized, and bury them unless the parent window has focus.6 Your job as an interface designer is to assist the user, not to gratuitously get in his face.

6 If your windowing system supports translucent popups that intrude less between the user and the application, use them.

In general, it’s bad style to tell the user things he already knows (“Program <foo> is starting up...”, or “Program <foo> is exiting” are two classic offenders). Your interface design as a whole should obey the Rule of Least Surprise, but the content of messages should obey a Rule of Most Surprise—be chatty only about things that deviate from what’s normally expected.

This rule has even greater force for confirmation prompts. Constantly asking for confirmation where the answer is almost always “yes” conditions the user to press “yes” without thinking about it, a habit that can have very unfortunate consequences. Programs should request confirmation only when there is good reason to suspect that the answer might be “no no no!” A confirmation request that is not a surprise is a strong hint of bad design. Any confirmation prompts at all may be a sign that what your interface really needs is an undo command.

If you want chatty progress messages for debugging purposes, disable them by default with a verbosity switch. Before releasing for production, relegate as many of the normal messages as possible to being displayed only when the verbosity switch is on.

## 12. Optimization

Premature optimization is the root of all evil.

—C. A. R. Hoare

This is going to be a very short chapter, because the main thing Unix experience teaches us about optimizing for performance is how to know when not to do it. A secondary lesson is that the most effective optimization tactics are usually things we do for other reasons, such as cleanness of design.


### 12.1 Don’t Just Do Something, Stand There!
The most powerful optimization technique in any programmer’s toolbox is to do nothing.

This very Zen advice is true for several reasons. One is the exponential effect of Moore’s Law—the smartest, cheapest, and often fastest way to collect performance gains is to wait a few months for your target hardware to become more capable. Given the cost ratio between hardware and programmer time, there are almost always better things to do with your time than to optimize a working system.

We can get mathematically specific about this. It is almost never worth doing optimizations that reduce resource use by merely a constant factor; it’s smarter to concentrate effort on cases in which you can reduce average-case running time or space use from O(n2) to O(n) or O(n log n),1 or similarly reduce from a higher order. Linear performance gains tend to be rapidly swamped by Moore’s Law.2

1 For readers unfamiliar with O notation, it is a way of indicating how the average running time of an algorithm changes with the size of its inputs. An O(1) algorithm runs in constant time. An O(n) algorithm runs in a time that is predicted by An + C, where A is some unknown constant of proportionality and C is an unknown constant representing setup time. Linear search of a list for a specified value is O(n). An O(n2) algorithm runs in time An2 plus lower-order terms (which might be linear, or logarithmic, of any other function lower than a quadratic). Checking a list for duplicate values (by the naïve method, not sorting it) is O(n2). Similarly, O(n3) algorithms have an average run time predicted by the cube of problem size; these tend to be too slow for practical use. O(log n) is typical of tree searches. Intelligent choice of algorithm can often reduce running time from O(n2) to O(log n). Sometimes when we are interested in predicting an algorithm’s memory utilization, we may notice that it varies as O(1) or O(n) or O(n2); in general, algorithms with O(n2) or higher memory utilization are not practical either.

2 The eighteen-month doubling time usually quoted for Moore’s Law implies that you can collect a 26% performance gain just by buying new hardware in six months.

Another very constructive form of doing nothing is to not write code. The program can’t be slowed down by code that isn’t there. It can be slowed down by code that is there but less efficient than it could be—but that’s a different matter.


### 12.2 Measure before Optimizing
When you have real-world evidence that your application is too slow, then (and only then) is the time to think about optimizing the code. But before you do more than think about optimizing, measure.

Recall Rob Pike’s six rules in Chapter 1. One of the lessons that the original Unix programmers learned early is that intuition is a poor guide to where the bottlenecks are, even for one who knows the code in question intimately. Unixes, unlike most other operating systems, usually come with profilers; use them.

Reading profiler results is something of an art. There are a couple of recurring problems: one is instrumentation noise, another is the effect of imposed external latencies, and a third is overweighting of upper nodes in the call graph.

The instrumentation-noise problem is fundamental. Profilers work by inserting instructions that report execution time at the entry and exit points of subroutines, also at fixed intervals within the inline code of routines. These instructions themselves take time to execute. The effect is to reduce the dispersion of call times: very short subroutines tend to look more expensive than they are, with a lot of noise in their comparative call times, while for longer ones the instrumentation overhead is invisible.

Bearing instrumentation noise in mind, it’s wise to assume that the times listed for the fastest, shortest subroutines are going to have a lot of froth and air in them. They can still be eating a lot of time if they are called very frequently, however, so pay particular attention to their call-count statistics.

The external-latency problem is also fundamental. There are various sorts of delay and distortion that can happen behind the profiler’s back. The simplest is overhead from operations with unpredictable latency—disk and network accesses, cache fills, process-context switches, and the like. The problem is not so much that these overheads happen—they may actually be what you’re trying to measure, especially if you’re focusing on whole-system performance rather than just tuning a critical inner loop. The problem is that they have a random component that means the results from any individual profiling run may not be very useful.

One way to minimize the effects of these noise sources, and get a better picture of where the time is going in the average case, is to add together the results from a lot of profiling runs. There are a lot of good reasons to build test harnesses and test loads for your programs before you get to optimizing; the most important reason, usually far more important than performance tuning, is so you can regression-test your program for correctness as you change it. Once you’ve done this, being able to profile repeated tests under load is a nice side effect that will often give you better information than a few runs by hand.

Various effects tend to allocate time spent to calling routines rather than callees, overweighting upper modes in the call graph. Function-call overhead, for example, is often charged to the calling routine (whether or not this is true depends partly on your machine architecture and where the profiler is allowed to insert probes). Macros and inline functions, if your compiler supports them, won’t show up in the profiling report at all; every bit of their time gets charged to the calling function.

More importantly, many time-reporting tools give a display in which time spent in subroutines is charged to the caller. (The gprof(1) profiler distributed with open-source Unixes has this trait.) Naïvely subtracting callee time from caller time won’t give you a useful result if the same routine can have more than one caller—the effect would be to artificially deflate both callers’ times. Especially nasty is the common case of a utility function with multiple call sites, some of which make lots of trivial calls and others of which make a few complicated ones.

To get more transparent results, factor your code so that upper-level routines consist as much as possible of calls to lower-level routines, rather than in-line code. If you keep the overhead of upper-level control logic to a minimum, the call structure of the code will tend to organize the profile report in a way that is relatively easy to read.

You’ll get more insight from using profilers if you think of them less as ways to collect individual performance numbers, and more as ways to learn how performance varies as a function of interesting parameters (e.g., problem size, CPU speed, disc speed, memory size, compiler optimization, or whatever else is relevant). Try fitting those numbers to a model, using open-source software like R or a good-quality proprietary tool like MATLAB.

The natural smoothing of the data that results from model fitting tends to focus on the big effects and cover up the small, noisy ones. For example, by fitting a cubic to the matrix inversion routine in MATLAB on random matrices from 10 × 10 to 1000 × 1000, it is clear that we actually have three cubics, with clearly defined boundaries, that correspond roughly to “in cache”, “in memory but out of cache”, and “out of memory”. The data shows us this effect even if weren’t looking for it, just by looking at the deviations from the best fit.

—Steve Johnson


### 12.3 Nonlocality Considered Harmful
The most effective way to optimize your code is to keep it small and simple. We’ve been through lots of good reasons to keep it small and simple earlier in this book. Here’s a new one: you want the central data structures and the time-critical loops in your code never to fall out of cache.

Consider your target machine as a hierarchy of memory types arranged by distance from the processor. There are the processor’s own registers; its instruction pipeline; the level-one (L1) cache; the level-two (L2) cache; possibly a level-three (L3) cache; main memory (what Unix old hands still quaintly call ’core’); and the disk drives where swap space lives. Technologies like SMP, shared-memory clusters, and non-uniform memory access (NUMA) add more layers to the picture but only widen the overall spread.

Every kind of access to that stack is getting faster. Processor cycles are almost free, outside of a few demanding applications like modeling nuclear explosions or real-time video compression. But what’s also happening is that the speed ratios between layers in the storage hierarchy are all increasing as processor speeds go up. Thus, the relative cost of a cache miss is increasing.

So we have an interesting paradox. As machine resources plummet, the expected cost of large data structures falls—but because the cost spread between adjacent cache levels is also going up, the performance impact of being just large enough to break a cache boundary is also rising.

“Small is beautiful” is therefore better advice than ever, particularly with regard to central data structures that must live in the fastest possible cache. The advice applies to code as well; the average instruction spends more time being loaded than it does executing.

This turns some traditional advice on its head. Compiler optimizations like loop unrolling, which get rid of relatively expensive machine instructions in return for an increase in total code size, may no longer be worth doing. Another example is precomputing small tables—for example, a table of sin(x) by degree for optimizing rotations in a 3D graphics engine will take 365 × 4 bytes on a modern machine. Before processors got enough faster than memory to demand caching, this was an obvious speed optimization. Nowadays it may be faster to recompute each time rather than pay for the percentage of additional cache misses caused by the table.

But in the future, this might turn around again as caches grow larger. More generally, many optimizations are temporary and can easily turn into pessimizations as cost ratios change. The only way to know is to measure and see.


### 12.4 Throughput vs. Latency
Another effect of fast processors is that performance is usually bounded by the cost of I/O and—especially with programs that use the Internet—network transactions. It’s therefore valuable to know how to design network protocols for good performance.

The most important issue is avoiding protocol round trips as much as possible. Every protocol transaction that requires a handshake turns any latency in the connection into a potentially serious slowdown. Avoiding such handshakes is not specifically a Unix-tradition practice, but it’s one that needs mention here because so many protocol designs lose huge amounts of performance to them.

I cannot say enough about latency. X11 went well beyond X10 in avoiding round trip requests: the Render extension goes even further. X (and these days, HTTP/1.1) is a streaming protocol. For example, on my laptop, I can execute over 4 million 1×1 rectangle requests (8 million no-op requests) per second. But round trips are hundreds or thousands of times more expensive. Anytime you can get a client to do something without having to contact the server, you have a tremendous win.

—Jim Gettys

In fact, a good rule of thumb is to design for the lowest possible latency and ignore bandwidth costs until your profiling tells you otherwise. Bandwidth problems can be solved later in development by tricks like compressing a protocol stream on the fly; but getting rid of high latency baked into an existing design is much, much harder (often, effectively impossible).

While this effect shows up most clearly in network protocol design, throughput vs. latency tradeoffs are a much more general phenomenon. In writing applications, you will sometimes face a choice between doing an expensive computation once in anticipation that it will be used several times, or computing only when actually needed (even if that means you will often recompute results). In most cases where you face a tradeoff like this, the right thing to do is bias toward low latency. That is, don’t try to precompute expensive operations unless you have a throughput requirement and know by actual measurement that the throughput you are getting is too low. Precomputation may seem efficient because it minimizes total use of processor cycles, but processor cycles are cheap. Unless you are doing one of a handful of monstrously compute-intensive applications like data mining, animation rendering, or the aforementioned bomb simulations, it is usually better to opt for short startup times and quick response.

In Unix’s early days this advice might have been considered heretical. Processors were much slower and cost ratios were very different then; also, the pattern of Unix use was tilted rather more strongly toward server operations. The point about the value of low latency needs to be made partly because even newer Unix developers sometimes inherit an old-time cultural prejudice toward optimizing for throughput. But times have changed.

Three general strategies for reducing latency are (a) batching transactions that can share startup costs, (b) allowing transactions to overlap, and (c) caching.


#### 12.4.1 Batching Operations
Graphics APIs are frequently written on the assumption that the fixed setup cost for a physical screen update is large. Consequently, the write operations actually modify an internal buffer. It is up to the programmer to decide when enough of these updates have been batched and to issue the call that turns them into a physical screen update. Picking the right spacing of physical updates can make a great deal of difference to the feel of the graphics client. Both the X server and the curses(3) library used by roguelike programs are organized in this way.

Persistent service daemons are a more Unix-specific example of batching. There are two reasons, one obvious and one subtle, to write persistent daemons (as opposed to CLI servers that are started up fresh for each session). The obvious reason is to manage updates to a shared resource. The less obvious reason, which obtains even for daemons that don’t handle updates, is to amortize the cost of reading in the daemon’s database across multiple requests. A perfect example of this is the DNS service daemon named(8), which must sometimes handle thousands of requests per second, each one of which may actually be blocking a user’s Web page load. One of the tactics that makes named(8) fast is that it replaces parses of expensive on-disk text files describing DNS zones with accesses to a cache held in memory.


#### 12.4.2 Overlapping Operations
In Chapter 5 we compared the POP3 and IMAP protocols for querying remote-mail servers. We noted that IMAP requests (unlike POP3 requests) are tagged with a request identifier generated by the client; the server, when it ships back a response, includes the tag of the request it pertains to.

POP3 requests have to be processed in lockstep by both client and server; the client sends a request, waits for the response to that request, and only then can prepare and ship the next one. IMAP requests, on the other hand, are are tagged so they can be overlapped. If an IMAP client knows that it wants to fetch multiple messages, it can stream several fetch requests (each with a different tag) to the IMAP server, without waiting for responses between them. Responses, each tagged, will come back when the server is ready; responses to early requests may come in while the client is still shipping later ones.

This strategy is general to more areas than network protocols. If you want to cut latency, blocking or waiting on intermediate results is deadly.


#### 12.4.3 Caching Operation Results
Sometimes you can get the best of both worlds (low latency and good throughput) by computing expensive results as needed and caching them for later use. Earlier we mentioned that named reduces latency by batching; it also reduces latency by caching the results of previous network transactions with other DNS servers.

Caching has its own problems and tradeoffs, which are well illustrated by one application: the use of binary caches to eliminate parsing overhead associated with text database files. Some variants of Unix have used this technique to speed up access to their password information (the usual motivation was to cut latency on logins at very large sites).

To make this work, all code that looks at the binary cache has to know that it should check the timestamps on both files and regenerate the cache if the text master is newer. Alternatively, all changes to the textual master must be made through a wrapper that will update the binary format.

While this approach can be made to work, it has all the disadvantages that the SPOT rule would lead us to expect. The duplication of data means that it doesn’t yield any economy of storage—it’s purely a speed optimization. But the real problem with it is that the code to ensure coherency between cache and master is notoriously leaky and bug-prone. Very frequently updated cache files can lead to subtle race conditions simply because of the 1-second resolution of timestamps.

Coherency can be guaranteed in simple cases. One such is the Python interpreter, which compiles and deposits on disk a p-code file with extension .pyc when a Python library file is first imported. On subsequent runs the cached copy of the p-code is loaded unless the source has since changed (this avoids reparsing the library source code on every run). Emacs Lisp uses a similar technique with .el and .elc files. This technique works because both read and write accesses to the cache go through a single program.

When the update pattern of the master is more complex, however, the synchronization code tends to spring leaks. The Unix variants that used this technique to speed up access to critical system databases were infamous for spawning system-administrator horror stories that reflected this.

In general, binary cache files are a brittle technique and probably best avoided. The work that went into implementing a special-purpose hack to reduce latency in this one case would have been better spent improving the application design so it doesn’t have a bottleneck there—or even on tuning to improve the speed of the file system or the virtual-memory implementation.

When you think you are in a situation that demands caching, it is wise to look one level deeper and ask why the caching is necessary. It may well be no more difficult to solve that problem than it would be to get all the edge cases in the caching software right.

## 11. Interfaces: User-Interface Design Patterns in the Unix Environment

All our knowledge has its origins in our perceptions.

—Leonardo Da Vinci

The interface of a program is the sum of all the ways that it communicates with human users and other programs. In Chapter 10, we discussed the use of environment variables, switches, run-control files and other parts of start-up-time interfaces. In this chapter, we’ll untangle the history and explain the pragmatics of Unix interfaces after startup time. Because user-interface code normally consumes 40% or more of development time, knowing good design patterns is especially important here in order to avoid a lot of false starts and time-intensive rewrites.

In the Unix tradition of interface design, we encounter two themes over and over again. One is anticipatory design for communication with other programs; the other is the Rule of Least Surprise.

Unix programs can give you extra power from being used in synergistic combinations; we discussed various methods for hooking together such combinations in Chapter 7. The ’other programs’ part of Unix interface design is not an afterthought or a marginal case as it is under many other operating systems. Rather, it is a central challenge that has to be balanced and integrated carefully with the demands of interface design for human users.

Much of Unix-community tradition about program interface design may seem odd and arbitrary—or even, in the age of the GUI, downright regressive—when you encounter that tradition for the first time. But in spite of various blemishes and irregularities, that tradition has an inner logic to it which is worth learning and understanding. It reflects heuristics accumulated over Unix’s long history about ways to do effective communication both with human beings and with other programs. And it includes a set of conventions which create commonalities between programs—it defines ’least surprising’ alternatives for a wide range of common interface-design problems.

After startup, programs normally get input or commands from the following sources:

• Data and commands presented on the program’s standard input.

• Inputs passed through IPC, such as X server events and network messages.

• Files and devices in known locations (such as a data file name passed to or computed by the program).

Programs can emit results in all the same ways (with output going to standard output).

Some Unix programs are graphical, some have screen-oriented character interfaces, and some use a starkly simple text-filter design unchanged from the days of mechanical teletypes. To the uninitiated, it is often far from obvious why any given program uses the style it does—or, indeed, why Unix supports such a plethora of interface styles at all.

Unix has several competing interface styles. All are still alive for a reason; they’re optimized for different situations. By understanding the fit between task and interface style, you will learn how to choose the right styles for the jobs you need to do.


### 11.1 Applying the Rule of Least Surprise
The Rule of Least Surprise is a general principle in the design of all kinds of interfaces, not just software: “Do the least surprising thing”. It’s a consequence of the fact that human beings can only pay attention to one thing at one time (see The Humane Interface [Raskin]). Surprises in the interface focus that single locus of attention on the interface, rather than on the task where it belongs.

Thus, to design usable interfaces, it’s best when possible not to design an entire new interface model. Novelty is a barrier to entry; it puts a learning burden on the user, so minimize it. Instead, think carefully about the experience and knowledge of your user base. Try to find functional similarities between your program and programs they are likely to already know about. Then mimic the relevant parts of the existing interfaces.

The Rule of Least Surprise should not be interpreted as a call for mechanical conservatism in design. Novelty raises the cost of a user’s first few interactions with an interface, but poor design will make the interface needlessly painful forever. As in other sorts of design, rules are not a substitute for good taste and engineering judgment. Consider your tradeoffs carefully—and consider them from the user’s point of view. The bias implied by the Rule of Least Surprise is a good one to hold consciously, mainly because interface designers (like other programmers) have an unconscious tendency to be too clever for the user’s good.

One implication of the Rule of Least Surprise is this: Wherever possible, allow the user to delegate interface functions to a familiar program. We already observed in Chapter 7 that, if your program requires the user to edit significant amounts of text, you should write it to call an editor (specifiable by the user) rather than building in your own integrated editor. This will enable the users, who know their preferences better than you, to choose the least surprising alternative.

Elsewhere in this book we have advocated symbiosis and delegation as tactics for promoting code reuse and minimizing complexity. The point here is that when users can intercept the delegation, and direct it to an agent of their own choice, these techniques become not merely economical for the developer but actively empowering to users.

Further: When you can’t delegate, emulate. The purpose of the Rule of Least Surprise is to reduce the amount of complexity a user must absorb to use an interface. Continuing the editor example, this means that if you must implement an embedded editor, it’s best if the editor commands are a subset of those for a well-known general-purpose editor. (Or more than one. Both bash and ksh have command-line editors that allow the user to choose between vi and Emacs editing styles.)

Under the Unix versions of the Netscape and Mozilla Web browsers, for example, fill-in fields in forms recognize a subset of the default bindings for the Emacs editor. Control-A goes to start of line, Control-D deletes the next character, and so forth. This choice helps people who know Emacs, and leaves others no worse off than an arbitrary, idiosyncratic command set would have. The only way it could have been bettered was by choosing key bindings associated with some editor significantly more widely used than Emacs; and among Netscape’s original user population there was no such animal.

These principles can be applied in many other areas of interface design. They suggest, for example, that it is deeply foolish to create novel document formats for an on-line help system when users are comfortable with an HTML Web browser. Or even that if you are designing an arcade-style game, it is wise to look at the gesture sets of previous games to see if you can give new users a feeling of comfort by allowing them to transfer joystick skills learned in other games.


### 11.2 History of Interface Design on Unix
Unix predates the modern graphics-intensive style of software interface design. For over a decade after the first Unix in 1969, command-line interfaces (CLIs) on teletypes and dumb text-mode terminals were the norm. Most of the basic Unix toolset (programs like ls(1), cat(1), and grep(1)) still reflect this heritage.

Gradually, after 1980, Unix evolved support for screen-painting on character-cell terminals. Programs began to mix command-line and visual interfaces, with common commands often bound to keystrokes that would not be echoed to the screen. Some of the early programs written in this style (often called ’curses’ programs, after the screen-painting cursor-control library normally used to implement them, or ’roguelike’ after the first application to use curses) are still used today; notable examples include the dungeon-crawling game rogue(1), the vi(1) text editor, and (from a few years later) the elm(1) mailer and its modern descendant mutt(1).

A few years later in the mid-1980s, the computing world as a whole began to assimilate the results of the pioneering work on graphical user interfaces (GUIs) that had been going on at Xerox’s Palo Alto Research Center since the early 1970s. On personal computers, the Xerox PARC work inspired the Apple Macintosh interface and through that the design of Microsoft Windows. Unix’s adaptation of these ideas took a rather more complicated path.

Around 1987 the X windowing system outcompeted several early contenders and prototype efforts to become the standard graphical-interface facility for Unix. Whether this was a good or a bad thing has remained a topic of debate ever since; some of the other contenders (notably Sun’s Network Window System or NeWS) were arguably rather more powerful and elegant. X, however, had one overriding virtue; it was open source. The code had been developed at MIT by a research group more interested in exploring the problem space than in creating a product, and it remained freely redistributable and modifiable. It was thus able to attract support from a wide range of developers and sponsoring corporations who would have been reluctant to line up behind a single vendor’s closed product. (This, of course, prefigured an important theme in the breakout of the Linux operating system ten years later.)

The designers of X decided early on that X would support “mechanism, not policy”. Their objective was to make X as flexible and portable across platforms as possible, while putting as few constraints on the look and feel of X programs as they could manage. Look and feel, they decided, would be handled by ’toolkits’—libraries calling X services linked to user programs. X would also be designed to support multiple window managers,1 and would not require a window manager to have any special privileges or uniquely close integration with X’s machinery.

1 A window manager handles associations between windows on the screen and running tasks. Window managers handle behaviors like title bars, placement, minimizing, maximizing, moving, resizing, and shading windows.

This approach was the polar opposite of that taken by the Macintosh and Windows commercial products, which enforced particular look-and-feel policies by designing them right into the system. The difference in approach ensured that X would have a long-run evolutionary advantage by remaining adaptable as new discoveries were made about the human factors in interface design—but it also ensured that the X world would be divided by multiple toolkits, a profusion of window managers, and many experiments in look and feel.

Since the mid-1990s X has become ubiquitous even on the lowest-end personal Unix machines. Use of Unix from text-mode terminals, as opposed to graphics-capable computer consoles, has sharply declined and seems headed for extinction. Accordingly, the use of curses-style interfaces for new applications is also in decline; most new applications that would formerly have been designed in that style now use an X toolkit. It is instructive to note that Unix’s older CLI design tradition is still quite vigorous and successfully competes with X in many areas.

It is also instructive to note that there are a few specific application areas in which curses-style (or ’roguelike’) character-cell interfaces remain the norm—especially text editors and interactive communications programs such as mailers, newsreaders, and chat clients.

For historical reasons, then, there is a wide range of interface styles in Unix programs. Line-oriented, character-cell screen-oriented, and X-based—with the X-based world somewhat balkanized by the competition between multiple X toolkits and window managers (though this is less an issue in 2003 than was the case five or even three years ago).


### 11.3 Evaluating Interface Designs
All these interface styles survive because they are adapted for different jobs. When making design decisions about a project, it’s important to know how to pick a style (or combine styles) that will be appropriate to your application and your user population.

We will use five basic metrics to categorize interface styles: concision, expressiveness, ease, transparency, and scriptability. We’ve already used some of these terms earlier in this book in ways that were preparation for defining them here. They are comparatives, not absolutes; they have to be evaluated with respect to a particular problem domain and with some knowledge of the users’ skill base. Nevertheless, they will help organize our thinking in useful ways.

A program interface is ’concise’ when the length and complexity of actions required to do a transaction with it has a low upper bound (the measurement might be in keystrokes, gestures, or seconds of attention required). Concise interfaces pack a lot of leverage into a relatively few bits or state changes.

Interfaces are ’expressive’ when they can readily be used to command a wide variety of actions. The most expressive interfaces can command combinations of actions not anticipated by the designer of the program, but which nevertheless give the user useful and consistent results.

The difference between concision and expressiveness is an important one. Consider two different ways of entering text: from a keyboard, or by picking characters from a screen display with mouse clicks. These have equal expressiveness, but the keyboard is more concise (as we can easily verify by comparing average text-entry speeds). On the other hand, consider two dialects of the same programming language, one with a complex-number type and one not. Within the problem domain they have in common, their concision will be identical; but for a mathematician or electrical engineer, the dialect with complex numbers will be much more expressive.

The ’ease’ of an interface is inversely proportional to the mnemonic load it puts on the user—how many things (commands, gestures, primitive concepts) the user has to remember specifically to support using that interface. Programming languages have a high mnemonic load and low ease; menus and well-labeled on-screen buttons are simpler.

Recall that we devoted an entire earlier chapter to ’transparency’. In that chapter we touched on the idea of interface transparency, and gave the audacity audio editor as one superb example of it. But we were then much more interested in transparency of a different kind, one that relates to the structure of code rather than of user interfaces. We therefore described UI transparency in terms of its effect (nothing obtrudes between the user and the problem domain) rather than the specific features of design that produce it. Now it’s time to zero in on these.

The ’transparency’ of an interface is how few things the user has to remember about the state of his problem, his data, or his program while using the interface. An interface has high transparency when it naturally presents intermediate results, useful feedback, and error notifications on the effects of a user’s actions. So-called WYSIWYG (What You See Is What You Get) interfaces are intended to maximize transparency, but sometimes backfire—especially by presenting an over-simplified view of the domain.

The related concept of discoverability applies to interface design, as well. A discoverable interface provides the user with assistance in learning it, such as a greeting message pointing to context-sensitive help, or explanatory balloon popups. Though discoverability has to be implemented in rather different ways for each of the interface styles we shall consider, the degree to which it is achievable is largely independent of interface style. Thus, we shall not use it as a metric in this discussion.

Note that transparency of code and design does not automatically imply transparency of interface, or vice versa! It is all too easy to point to code that has one but not the other.

The ’scriptability’ of an interface is the ease with which it can be manipulated by other programs (e.g., through the IPC mechanisms discussed in Chapter 7). Scriptable programs are readily usable as components by other programs, reducing the need for costly custom coding and making it relatively easy to automate repetitive tasks.

That last point—automating repetitive tasks—deserves more attention than it usually gets. Unix programmers, administrators, and users develop a habit of thinking through the routine procedures they use, then packaging them so they no longer have to manually execute or even think about them any more. This habit depends on scriptable interfaces. It is a quiet but tremendous productivity booster not available in most other software environments.

It will be useful to bear in mind that humans and computer programs have very different cost functions with respect to these metrics. So do novice and expert human users in a particular problem domain. We’ll explore how the tradeoffs between them change for different user populations.


### 11.4 Tradeoffs between CLI and Visual Interfaces
The CLI style of early Unix has retained its utility long after the demise of teletypes for two reasons. One is that command-line and command-language interfaces are more expressive than visual interfaces, especially for complex tasks. The other is that CLI interfaces are highly scriptable—they readily support the combining of programs, as we discussed in detail in Chapter 7. Usually (though not always) CLIs have an advantage in concision as well.

The disadvantage of the CLI style, of course, is that it almost always has high mnemonic load (low ease), and usually has low transparency. Most people (especially non-technical end users) find such interfaces relatively cryptic and difficult to learn.

On the other hand, the ’user-friendly’ GUIs of other operating systems have their own problems. Finding the right buttons to push is like playing Adventure: the interfaces are just as burdensome as any Unix command line interface, save that one can in theory find the treasure by sufficient exploration. In Unix, one needs the manual.

—Brian Kernighan

Database queries are a good example of the kind of interface for which pushing buttons is not just burdensome but extremely limiting. Neither keystroke commands to a full-screen character interface nor GUI gestures on a graphic display can express typical actions in the problem domain as expressively or concisely as typing SQL direct to a server. And it is certainly easier to make a client program utter SQL queries than it would be to have it simulate a user clicking a GUI!

On the other hand, many non-technical database users are so resistant to having to remember SQL syntax that they prefer a less concise and less expressive full-screen or GUI interface.

SQL is a good example for illustrating another point. The most powerful CLIs are not ad-hoc collections of commands, but imperative minilanguages designed along the lines we described in Chapter 8. These minilanguages are the highest-power, highest-complexity end of the CLI spectrum; they maximize expressiveness, but minimize ease. They are difficult to use and generally need to be discreetly veiled from ordinary end-users, but unbeatable when the capability and flexibility of the interface is the most important thing. When properly designed, they also score high on scriptability.

Some applications, unlike database queries, are naturally visual. Paint programs, Web browsers, and presentation software make three excellent examples. What these application domains have in common is that (a) transparency is extremely valuable, and (b) the primitive actions in the problem domain are themselves visual: “draw this”, “show me what I’m pointing at”, “put this here”.

The flip side of paint programs is that it is difficult to capture relationships within the pictures they are manipulating. It takes careful, thoughtful design to give the user any handle on the structure of images with repeated elements, for example. This is a general design problem with visual interfaces.

In Chapter 6 we looked at the Audacity sound file editor. Its interface design succeeds because it does a particularly clean job of mapping its audio application domain onto a simple set of visual representations (borrowed from equalizer displays on stereos). It does this by thoroughly following through the consequences of a single translation: sounds to waveform images. The visual operations are not a mere grab-bag of low-level tweaks; they are all tied to that translation.

In applications that are not naturally visual, however, visual interfaces are most appropriate for simple one-shot or infrequent tasks performed by novice users (a point the database example illustrates).

Resistance to CLI interfaces tends to decrease as users become more expert. In many problem domains, users (especially frequent users) reach a crossover point at which the concision and expressiveness of CLI becomes more valuable than avoiding its mnemonic load. Thus, for example, computing novices prefer the ease of GUI desktops, but experienced users often gradually discover that they prefer typing commands to a shell.

CLIs also tend to gain utility as problems scale up and involve more in the way of canned, procedural and repetitive actions. Thus, for example, a WYSIWYG desktop-publishing program is usually the easiest route to composing relatively small and unstructured documents such as business letters. But for complex book-sized documents that are assembled from sections and may require many global format changes or structural manipulation during composition, a minilanguage formatter such as troff, Tex, or some XML-markup processor is usually a more effective choice (see Chapter 18 for more discussion of this tradeoff).

Even in domains that are naturally visual, scaling up the problem size tends to tilt the tradeoff toward a CLI. If you need to fetch and save one Web page from a given URL, point and click (or type and click) is fine. But for Web forms, you’re going to use a keyboard. And if you need to fetch and save the pages corresponding to a given list of fifty URLs, a CLI client that can read URLs from standard input or the command line can save you a lot of unnecessary motion.

As another example, consider modifying the color table in a graphic image. If you want to change one color (say, to lighten it by an amount you will only know is right when you see it) a visual dialogue with a color-picker widget is almost mandatory. But suppose you need to replace the entire table with a set of specified RGB values, or to create and index large numbers of thumbnails. These are operations that GUIs usually lack the expressive power to specify. Even when they do, invoking a properly designed CLI or filter program will do the job far more concisely.

Finally (as we observed earlier on) CLIs are important in facilitating using programs from other programs. A GUI graphics editor that can handle making a batch of thumbnails for a list of files probably does it with a plugin written in a scripting language, calling an internal CLI of the graphics editor (as in the GIMP’s script-fu facility). Unix environments bring the value of CLIs into sharper relief precisely because their IPC facilities are rich, have low overhead, and are easily accessible from user programs.

The explosion of interest in GUIs since 1984 has had the unfortunate effect of obscuring the virtues of CLIs. The design of consumer software, in particular, has become heavily skewed toward GUIs. While this is a good choice for the novice and casual users that constitute most of the consumer market, it also exacts hidden costs on more expert users as they run up against the expressiveness limits of GUIs—costs which steadily increase as the users take on more demanding problems. Most of these costs derive from the fact that GUIs are simply not scriptable at all—every interaction with them has to be human-driven.

Gentner & Nielsen sum up the tradeoff very well in The Anti-Mac Interface [Gentner-Nielsen]: “[Visual interfaces] work well for simple actions with a small number of objects, but as the number of actions or objects increases, direct manipulation quickly becomes repetitive drudgery. The dark side of a direct manipulation interface is that you have to manipulate everything. Instead of an executive who gives high-level instructions, the user is reduced to an assembly-line worker who must carry out the same task over and over”. Noted science-fiction writer Neal Stephenson made the same point, less directly but more entertainingly, in his brilliant and discursive essay In the Beginning Was the Command Line [Stephenson].

A typical Unix old hand’s take on this problem is rather less theoretical:

The commercial world generally goes for the novice mode because (a) purchase decisions are often made on the basis of 30 seconds trial, and (b) it minimizes the demands on customer support to have only a dumbed-down GUI. I find many non-Unix systems very frustrating because, for example, they will provide no way to do something on a hundred or a thousand files; I want to write a script, and there’s no support for it. The basic problem is that they’ve assumed all users are novices all the time, and then they bash Unix because it doesn’t cater to that model.

—Mike Lesk

For the long haul, then—for serving both casual and expert users, for cooperating with other computer programs, and whether the problem domain is naturally visual or not—support for both CLI and visual interfaces is important. Unix’s history positions it well to meet both sets of needs. After presenting an indicative case study, we will examine the characteristic design patterns that the Unix tradition has evolved to meet them.


#### 11.4.1 Case Study: Two Ways to Write a Calculator Program
To be more concrete, let us contrast how the GUI and CLI styles can be usefully applied to the design of a simple interactive program: a desk calculator. Our examples for contrast are dc(1)/bc(1) and xcalc(1).

The original Unix desk calculator program, first distributed with Version 7, was dc(1)—a reverse-Polish-notation calculator that could handle unlimited-precision arithmetic. Later, an algebraic (infix notation) calculator language, bc(1), was implemented on top of dc (we used the relationship between these programs as a case study in Chapter 7, and again in Chapter 8). Both of these programs use a CLI. You type an expression on standard input, you press enter, and the value of the expression is printed on standard output.

The xcalc(1) program, on the other hand, visually simulates a simple calculator, with clickable buttons and a calculator-style display.


Figure 11.1. The xcalc GUI.

image

The xcalc(1) approach is simpler to describe because it mimics an interface with which novice users will be familiar; the man page says, in fact, “The numbered keys, the +/– key, and the +, –, *, /, and = keys all do exactly what you would expect them to”. All the capabilities of the program are conveyed by the visible button labels. This is the Rule of Least Surprise in its strongest form, and a real advantage for infrequent and novice users who will never have to read a man page to use the program.

However, xcalc also inherits the almost complete non-transparency of a calculator; when evaluating a complex expression, you don’t get to see and sanity-check your keystrokes—which can be a problem if, say, you misplace a decimal point in an expression like (2.51 + 4.6) * 0.3. There’s no history, so you can’t check. You’ll get a result, but it won’t be the result of the calculation you intended.

With the dc(1) and bc(1) programs, on the other hand, you can edit mistakes out of the expression as you build it. Their interface is more transparent, because you can see the calculation that is being performed at every stage. It is more expressive because the dc/bc interpreter, not being limited to what fits on a reasonably-sized visual mockup of a calculator, can include a much larger repertoire of functions (and facilities such as if/then/else, stored variables, and iteration). It also incurs, of course, a higher mnemonic load.

Concision is more of a toss-up; good typists will find the CLI more concise, while poor ones may find it faster to point and click. Scriptability is not a toss-up; dc/bc can easily be used as a filter, but xcalc can’t be scripted at all.

The tradeoff between ease for novices and utility for expert users is very clear here. For casual use in situations where a mental-arithmetic error check is not hard, xcalc wins. For more complex calculations where the steps must not only be correct but must be seen to be correct, or in which they are most conveniently generated by another program, dc/bc wins.


### 11.5 Transparency, Expressiveness, and Configurability
Unix programmers inherit a strong bias toward making interfaces expressive and configurable. Like programmers from other traditions, they think about how to match their interfaces to the target audience—but they differ in how they deal with uncertainty about that target audience. Software developers whose experience is primarily with client operating systems default toward making interfaces simple; they are willing to sacrifice expressiveness to gain ease. Unix programmers default toward making interfaces expressive and transparent, and are more willing to sacrifice ease to get these qualities.

The results of this attitude have often been described as interfaces written “by programmers, for programmers”. But this oversimplifies the matter in an important way. When a Unix programmer opts for configurability and expressiveness over ease, he is not necessarily thinking of his audience as consisting solely of other programmers; rather, he is often acting on a gut-level instinct that in the absence of knowledge about end-users’ intentions it is best not to patronize or second-guess them.

The downside of this attitude (which is a close cousin to “mechanism, not policy”) is a tendency to assume that when the highly configurable and expressive interface is done, the job is finished... even if the result is almost impossible for anyone else to use without lengthy study. The flip side of configurability is an urgent need for good defaults and an easy way to set everything to the default. The flip side of expressivity is a need for guidance—be it in the program or the documentation—on where to get started and how to achieve the most commonly-desired results.

—Henry Spencer

The Rule of Transparency also has an influence. When a Unix programmer is writing to meet an RFC or other standard that defines a set of control options, he tends to assume that his job is to provide a complete and transparent interface to all of those options; whether or not he thinks any given one will actually be used is secondary. His job is mechanism; policy belongs to the user.

This mindset leads to a much stricter attitude about what constitutes standards conformance, one in which incomplete support is much less tolerable. In cases where a Macintosh or Windows developer would say “We don’t need to support that feature of the standard; most users won’t care, and it’s too complicated for them”, a Unix developer is likely to say “We don’t know that nobody will ever want this feature or option, therefore we must support it”.

These attitudes can lead to clashes when a Unix programmer is working with others, who are likely to interpret his design choices as a blithe willingness to burden users with technical details that are obscure, pointless, and even frightening. Mac or Windows programmers fear scaring away the many to serve the advanced needs of the few.

The Unix programmer, on the other hand, is likely to see defaulting away from expressiveness as a sort of cop-out or even betrayal of future users, who will know their own requirements better than the present implementer. Ironically, though the Unix attitude is often construed as a sort of programmer arrogance, it is actually a form of humility—one often acquired along with years of battle scars.

The extent to which the Unix attitude is appropriate varies. Whichever side of this divide you the reader are on, it is wise to learn to listen to the other, and wise to understand the premises behind the opposing point of view. Rather than falling into the trap of either intimidating users or condescending to them, it may be possible to build transparent interfaces in which the advanced features are present but inconspicuous. The audacity and kmail case studies in Chapter 6 are good examples to follow.

Finally, a note about user-interface design for nontechnical end-users. This is a demanding art, and Unix programmers don’t have a tradition of being very good at it. But with the ideas we’ve developed from examining the Unix tradition, it is possible to make one strong and useful statement about it. That is: when people say a user interface is intuitive, what they mean is that it (a) is discoverable, (b) is transparent in use, and (c) obeys the Rule of Least Surprise.2 Of these three rules, Least Surprise is the least binding; initial surprises can be coped with if discoverability and transparency make longer-term use rewarding.

2 This insight comes to us from a nontechnical end-user who just happens to be the author’s wife Catherine Raymond.

The user interfaces of today’s cellphones (for example) have relatively high mnemonic load in that you have to maintain at least a rough mental map of the interface menus to use them rapidly without constantly having to spend attention on checking where you are in the hierarchy. But the better-designed ones rapidly become ’intuitive’ for their users anyway, because they have these three qualities.

Intuitiveness is not quite the same quality as ease, because (as the cellphone example shows) people can develop what they think of as ’intuitions’ about transparent interfaces that have fairly high mnemonic load, as long as simple operations are easy and there is a discovery path that allows them to assimilate the interface’s more difficult corners one step at a time.


### 11.6 Unix Interface Design Patterns
In the Unix tradition, the tradeoffs we described above are met by well-established interface design patterns. Here is a bestiary of these patterns, with analyses and examples. We’ll follow it with a discussion of how to apply them.

Note that this bestiary does not include GUI design patterns (though it includes a design pattern that can use a GUI as a component). There are no design patterns in graphical user interfaces themselves that are specifically native to Unix. A promising beginning of a discussion of GUI design patterns in general can be found at Experiences—A Pattern Language for User Interface Design [Coram-Lee].

Also note that programs may have modes that fit more than one interface pattern. A program that has a compiler-like interface, for example, may behave as a filter when no file arguments are specified on the command line (many format converters behave like this).


#### 11.6.1 The Filter Pattern
The interface-design pattern most classically associated with Unix is the filter. A filter program takes data on standard input, transforms it in some fashion, and sends the result to standard output. Filters are not interactive; they may query their startup environment, and are typically controlled by command-line options, but they do not require feedback or commands from the user in their input stream.

Two classic examples of filters are tr(1) and grep(1). The tr(1) program is a utility that translates data on standard input to results on standard output using a translation specification given on the command line. The grep(1) program selects lines from standard input according to a match expression specified on the command line; the resulting selected lines go to standard output. A third is the sort(1) utility, which sorts lines in input according to criteria specified on the command line and issues the sorted result to standard output.

Both grep(1) and sort(1) (but not tr(1)) can alternatively take data input from a file (or files) named on the command line, in which case they do not read standard input but act instead as though that input were the catenation of the named files read in the order they appear. (In this case it is also expected that specifying “-” as a filename on the command line will direct the program explicitly to read from standard input.) The archetype of such ’catlike’ filters is cat(1), and filters are expected to behave this way unless there are application-specific reasons to treat files named on the command line differently.

When designing filters, it is well to bear in mind some additional rules, partly developed in Chapter 1:

Remember Postel’s Prescription: Be generous in what you accept, rigorous in what you emit. That is, try to accept as loose and sloppy an input format as you can and emit as well-structured and tight an output format as you can. Doing the former reduces the odds that the filter will be brittle in the face of unexpected inputs, and break in someone’s hand (or in the middle of someone’s toolchain). Doing the latter increases the odds that your filter will someday be useful as an input to other programs.
When filtering, never throw away information you don’t need to. This, too, increases the odds that your filter will someday be useful as an input to other programs. Information you discard is information that no later stage in a pipeline can use.
When filtering, never add noise. Avoid adding nonessential information, and avoid reformatting in ways that might make the output more difficult for downstream programs to parse. The most common offenders are cosmetic touches like headers, footers, blank/ruler lines, summaries and conversions like adding aligned columns, or writing a factor of “1.5” as “150%”. Times and dates are a particular bother because they’re hard for downstream programs to parse. Any such additions should be optional and controlled by switches. If your program emits dates, it’s good practice to have a switch that can force them into ISO8601 YYYY-MM-DD and hh:mm:ss formats—or, better yet, use those by default.
The term “filter” for this pattern is long-established Unix jargon.

“Filter” is indeed long-established. It came into use on day one of pipes. The term was a natural transferral from electrical-engineering usage: data flowed from source through filters to sink. Source or sink could be either process or file. The collective EE term, “circuit”, was never considered, since the plumbing metaphor for data flow was already well established.

—Doug McIlroy

Some programs have interface design patterns like the filter, but even simpler (and, importantly, even easier to script). They are cantrips, sources, and sinks.


#### 11.6.2 The Cantrip Pattern
The cantrip interface design pattern is the simplest of all. No input, no output, just an invocation and a numeric exit status. A cantrip’s behavior is controlled only by startup conditions. Programs don’t get any more scriptable than this.

Thus, the cantrip design pattern is an excellent default when the program doesn’t require any runtime interaction with the user other than fairly simple setup of initial conditions or control information.

Indeed, because scriptability is important, Unix designers learn to resist the temptation to write more interactive programs when cantrips will do. A collection of cantrips can always be driven from an interactive wrapper or shell program, but interactive programs are harder to script. Good style therefore demands that you try to find a cantrip design for your tool before giving in to the temptation to write an interactive interface that will be harder to script. And when interactivity seems necessary, remember the characteristic Unix design pattern of separating the engine from the interface; often, the right thing is an interactive wrapper written in some scripting language that calls a cantrip to do the real work.

The console utility clear(1), which simply clears your screen, is the purest possible cantrip; it doesn’t even take command-line options. Other classic simple examples are rm(1) and touch(1). The startx(1) program used to launch X is a complex example, typical of a whole class of daemon-summoning cantrips.

This interface design pattern, though fairly common, has not traditionally been named; the term “cantrip” is my invention. (In origin, it’s a Scots-dialect word for a magic spell, which has been picked up by a popular fantasy-role-playing game to tag a spell that can be cast instantly, with minimal or no preparation.)


#### 11.6.3 The Source Pattern
A source is a filter-like program that requires no input; its output is controlleld only by startup conditions. The paradigmatic example would be ls(1), the Unix directory lister. Other classic examples include who(1) and ps(1).

Under Unix, report generators like ls(1), ps(1), and who(1) tend strongly to obey the source pattern, so their output can be filtered with standard tools.

The term ’source’ is, as Doug McIlroy noted, very traditional. It is less common than it might be because ’source’ has other important meanings.


#### 11.6.4 The Sink Pattern
A sink is a filter-like program that consumes standard input but emits nothing to standard output. Again, its actions on the input data are controlled only by startup conditions.

This interface pattern is unusual, and there are few well-known examples. One is lpr(1), the Unix print spooler. It will queue text passed to it on standard input for printing. Like many sink programs, it will also process files named to it on the command line. Another example is mail(1) in its mail-sending mode.

Many programs that might appear at first glance to be sinks take control information as well as data on standard input and are actually instances of something like the ed pattern (see below).

The term sponge is sometimes applied specifically to sink programs like sort(1) that must read their entire input before they can process any of it.

The term ’sink’ is traditional and common.


#### 11.6.5 The Compiler Pattern
Compiler-like programs use neither standard output nor standard input; they may issue error messages to standard error, however. Instead, a compiler-like program takes file or resource names from the command line, transforms the names of those resources in some way, and emits output under the transformed names. Like cantrips, compiler-like programs do not require user interaction after startup time.

This pattern is so named because its paradigm is the C compiler, cc(1) (or, under Linux and many other modern Unixes, gcc(1)). But it is also widely used for programs that do (for example) graphics file conversions or compression/decompression.

A good example of the former is the gif2png(1) program used to convert GIF (Graphic Interchange Format) to PNG (Portable Network Graphics).3 Good examples of the latter are the gzip(1) and gunzip(1) GNU compression utilities, almost certainly shipped with your Unix system.

3 Sources for this program, and other converters with similar interfaces, are available at the PNG website <http://www.cdrom.com/pub/png/>.

In general, the compiler interface design pattern is a good model when your program often needs to operate on multiple named resources and can be written to have low interactivity (with its control information supplied at startup time). Compiler-like programs are readily scriptable.

The term “compiler-like interface” for this pattern is well-understood in the Unix community.


#### 11.6.6 The ed pattern
All the previous patterns have very low interactivity; they use only control information passed in at startup time, and separate from the data. Many programs, of course, need to be driven by a continuing dialog with the user after startup time.

In the Unix tradition, the simplest interactive design pattern is exemplified by ed(1), the Unix line editor. Other classic examples of this pattern include ftp(1) and sh(1), the Unix shell. The ed(1) program takes a filename argument; it modifies that file. On its input, it accepts command lines. Some of the commands result in output to standard output, which is intended to be seen immediately by the user as part of the dialog with the program.

An actual sample ed(1) session will be included in Chapter 13.

Many browserlike and editorlike programs under Unix obey this pattern, even when the named resource they edit is something other than a text file. Consider gdb(1), the GNU symbolic debugger, as an example.

Programs obeying the ed interface design pattern are not quite so scriptable as would be the simpler interface types resembling filters. You can feed them commands on standard input, but it is trickier to generate sequences of commands (and interpret any output they might ship back) than it is to just set environment variables and command-line options. If the action of the commands is not so predictable that they can be run blind (e.g., with a here-document as input and ignoring output), driving ed-like programs requires a protocol, and a corresponding state machine in the calling process. This raises the problems we noted in Chapter 7 during the discussion of slave process control.

Nevertheless, this is the simplest and most scriptable pattern that supports fully interactive programs. Accordingly, it is still quite useful as a component of the “separated engine and interface” pattern we’ll describe below.


#### 11.6.7 The Roguelike Pattern
The roguelike pattern is so named because its first example was the dungeon-crawling game rogue(1) (see Figure 11.2) under BSD; the adjective “roguelike” for this pattern is widely recognized in Unix tradition. Roguelike programs are designed to be run on a system console, an X terminal emulator, or a video display terminal. They use the full screen and support a visual interface style, but with character-cell display rather than graphics and a mouse.


Figure 11.2. Screen shot of the original Rogue game.

image

Commands are typically single keystrokes not echoed to the user (as opposed to the command lines of the ed pattern), though some will open a command window (often, though not always, the last line of the screen) on which more elaborate invocations can be typed. The command architecture often makes heavy use of the arrow keys to select screen locations or lines on which to operate.

Programs written in this pattern tend to model themselves on either vi(1) or emacs(1) and (obeying the Rule of Least Surprise) use their command sequences for common operations such as getting help or terminating the program. Thus, for example, one can expect one of the commands ’x’, ’q’, or ’C-x C-c’ to terminate a program written to this pattern.

Some other interface tropes associated with this pattern include: (a) the use of one-item-per-line menus, with the currently-selected item indicated by bold or reverse-video highlighting, and (b) ’mode lines’—program status summaries carried on a highlighted screen line, often near the bottom or at the top of the screen.

The roguelike pattern evolved in a world of video display terminals; many of these didn’t have arrow or function keys. In a world of graphics-capable personal computers, with character-cell terminals a fading memory, it’s easy to forget what an influence this pattern exerted on design; but the early exemplars of the roguelike pattern were designed a few years before IBM standardized the PC keyboard in 1981. As a result, a traditional but now archaic part of the roguelike pattern is the use of the h, j, k, and l as cursor keys whenever they are not being interpreted as self-inserting characters in an edit window; invariably k is up, j is down, h is left, and l is right. This history also explains why older Unix programs tend not to use the ALT keys and to use function keys in a limited way if at all.

Programs obeying this pattern are legion: The vi(1) text editor in all its variants, and the emacs(1) editor; elm(1), pine(1), mutt(1), and most other Unix mail readers; tin(1), slrn(1), and other Usenet newsreaders; the lynx(1) Web browser; and many others. Most Unix programmers spend most of their time driving programs with interfaces like these.

The roguelike pattern is hard to script; indeed scripting it is seldom even attempted. Among other things, this pattern uses raw-mode character-by-character input, which is inconvenient for scripting. It’s also quite hard to interpret the output programmatically, because it usually consists of sequences of incremental screen-painting actions.

Nor does this pattern have the visual slickness of a mouse-driven full GUI. While the point of using the full screen interface is to support simple kinds of direct-manipulation and menu interfaces, roguelike programs still require users to learn a command repertoire. Indeed, interfaces built on the roguelike pattern show a tendency to degenerate into a sort of cluttered wilderness of modes and meta-shift-cokebottle commands that only hard-core hackers can love. It would seem that this pattern has the worst of both worlds, being neither scriptable nor conforming to recent fashions in design for end-users.

But there must be some value in this pattern. Roguelike mailers, newsreaders, editors, and other programs remain extremely popular even among people who invariably run them through terminal emulators on an X display that supports GUI competitors. Moreover, the roguelike pattern is so pervasive that under Unix even GUI programs often emulate it, adding mouse and graphics support to a command and display interface that still looks rather roguelike. The X mode of emacs(1), and the xchat(1) client are good examples of such adaptation. What accounts for the pattern’s continuing popularity?

Efficiency, and perceived efficiency, seem to be important factors. Roguelike programs tend to be fast and lightweight relative to their nearest GUI competitors. For startup and runtime speed, running a roguelike program in an Xterm may be preferable to invoking a GUI that will chew up substantial resources setting up its displays and respond more slowly afterwards. Also, programs with a roguelike design pattern can be used over telnet links or low-speed dialup lines for which X is not an option.

Touch-typists often prefer roguelike programs because they can avoid taking their hands off the keyboard to move a mouse. Given a choice, touch-typists will prefer interfaces that minimize keystrokes far off the home row; this may account for a significant percentage of vi(1)’s popularity.

Perhaps more importantly, roguelike interfaces are predictable and sparing in their use of screen real estate on an X display; they do not clutter the display with multiple windows, frame widgets, dialog boxes, or other GUI impedimenta. This makes the pattern well suited for use in programs that must frequently share the user’s attention with other programs (as is especially the case with editors, mailers, newsreaders, chat clients, and other communication programs).

Finally (and probably most importantly) the roguelike pattern tends to appeal more than GUIs to people who value the concision and expressiveness of a command set enough to tolerate the added mnemonic load. We saw above that there are good reasons for this preference to become more common as task complexity, use frequency, and user experience rise. The roguelike pattern meets this preference while also supporting GUI-like elements of direct manipulation as an ed-pattern program cannot. Thus, far from having only the worst of both worlds, the roguelike interface design pattern can capture some of the best.


#### 11.6.8 The ’Separated Engine and Interface’ Pattern
In Chapter 7 we argued against building monster single-process monoliths, and that it is often possible to lower the global complexity of programs by splitting them into communicating pieces. In the Unix world, this tactic is frequently applied by separating the ’engine’ part of the program (core algorithms and logic specific to its application domain) from the ’interface’ part (which accepts user commands, displays results, and may provide services such as interactive help or command history). In fact, this separated-engine-and-interface pattern is probably the one most characteristic interface design pattern of Unix.

(The other, more obvious candidate for that distinction would be filters. But filters are more often found in non-Unix environments than engine/interface pairs with bidirectional traffic between them. Simulating pipelines is easy; the more sophisticated IPC mechanisms required for engine/interface pairs are hard.)

Owen Taylor, maintainer of the GTK+ library widely used for writing user interfaces under X, beautifully brings out the engineering benefits of this kind of partitioning at the end of his note Why GTK_MODULES is not a security hole <http://www.gtk.org/setuid.html>; he finishes by writing “[T]he secure setuid program is a 500 line program that does only what it needs to, rather than a 500,000 line library whose essential task is user interfaces”.

This is not a new idea. Xerox PARC’s early research into graphical user interfaces led them to propose the “model-view-controller” pattern as an archetype for GUIs.

• The “model” is what in the Unix world is usually called an “engine”. The model contains the domain-specific data structures and logic for your application. Database servers are archetypal examples of models.

• The “view” part is what renders your domain objects into a visible form. In a really well-separated model/view/controller application, the view component is notified of updates to the model and responds on its own, rather than being driven synchronously by the controller or by explicit requests for a refresh.

• The “controller” processes user requests and passes them as commands to the model.

In practice, the view and controller parts tend to be more closely bound together than either is to the model. Most GUIs, for example, combine view and controller behavior. They tend to be separated only when the application demands multiple views of the model.

Under Unix, application of the model/view/controller pattern is far more common than elsewhere precisely because there is a strong “do one thing well” tradition, and IPC methods are both easy and flexible.

An especially powerful form of this technique couples a policy interface (often a GUI combining view and controller functions) with an engine (model) that contains an interpreter for a domain-specific minilanguage. We examined this pattern in Chapter 8, focusing on minilanguage design; now it’s time to look at the different ways that such engines can form components of larger systems of code.

There are several major variants of this pattern.


#### 11.6.8.1 Configurator/Actor Pair
In a configurator/actor pair, the interface part controls the startup environment of a filter or daemon-like program which then runs without requiring user commands.

The programs fetchmail(1) and fetchmailconf(1) (which we’ve already used as case studies in discoverability and data-driven programming and will encounter again as language case studies in Chapter 14) are a good example of a configurator/actor pair. fetchmailconf is the interactive dotfile configurator that ships with fetchmail. fetchmailconf can also serve as a GUI wrapper that runs fetchmail in either foreground or background mode.

This design pattern enables both fetchmail and fetchmailconf to specialize in what they do well, and indeed to be written in different languages appropriate to their task domains. Fetchmail, which usually runs in background as a daemon, need not be bloated with GUI code. Conversely, fetchmailconf can specialize in elaborate GUIness without exacting size and complexity costs from fetchmail. Finally, because the information channels between them are narrow and well-defined, it remains possible to drive fetchmail from the command line and from scripts other than fetchmailconf.

The term “configurator/actor” is my invention.


#### 11.6.8.2 Spooler/Daemon Pair
A slight variant of the configurator/actor pair can be useful in situations that require serialized access to a shared resource in a batch mode; that is, when a well-defined job stream or sequence of requests requires some shared resource, but no individual job requires user interaction.

In this spooler/daemon pattern, the spooler or front end simply drops job requests and data in a spool area. The job requests and data are simply files; the spool area is typically just a directory. The location of the directory and the format of the job requests are agreed on by the spooler and daemon.

The daemon runs forever in background, polling the spool directory, looking there for work to do. When it finds a job request, it tries to process the associated data. If it succeeds, the job request and data are deleted out of the spool area.

The classic example of this pattern is the Unix print spooler system, lpr(1)/lpd(1). The front end is lpr(1); it simply drops files to be printed in a spool area periodically scanned by lpd. lpd’s job is simply to serialize access to the printer devices.

Another classic example is the pair at(1)/atd(1), which schedules commands for execution at specified times. A third example, historically important though no longer in wide use, was UUCP—the Unix-to-Unix Copy Program commonly used as a mail transport over dial-up lines before the Internet explosion of the early 1990s.

The spooler/daemon pattern remains important in mail-transport programs (which are batchy by nature). The front ends of mail transports such as sendmail(1) and qmail(1) usually make one try at delivering mail immediately, through SMTP over an outbound Internet connection. If that attempt fails, the mail will fall into a spool area; a daemon version or mode of the mail transport will retry the delivery later.

Typically, a spooler/daemon system has four parts: a job launcher, a queue lister, a job-cancellation utility, and a spooling daemon, In fact, the presence of the first three parts is a sure clue that there is a spooler daemon behind them somewhere.

The terms “spooler” and “daemon” are well-established Unix jargon. (’Spooler’ actually dates back to early mainframe days.)


#### 11.6.8.3 Driver/Engine Pair
In this pattern, unlike a configurator/actor or spooler/server pair, the interface part supplies commands to and interprets output from an engine after startup; the engine has a simpler interface pattern. The IPC method used is an implementation detail; the engine may be a slave process of the driver (in the sense we discussed in Chapter 7) or the engine and driver may communicate through sockets, or shared memory, or any other IPC method. The key points are (a) the interactivity of the pair, and (b) the ability of the engine to run standalone with its own interface.

Such pairs are trickier to write than configurator/actor pairs because they are more tightly and intricately coupled; the driver must have knowledge not merely about the engine’s expected startup environment but about its command set and response formats as well.

When the engine has been designed for scriptability, however, it is not uncommon for the driver part to be written by someone other than the engine author, or for more than one driver to front-end a given engine. An excellent example of both is provided by the programs gv(1) and ghostview(1), which are drivers for gs(1), the Ghostscript interpreter. GhostScript renders PostScript to various graphics formats and lower-level printer-control languages. The gv and ghostview programs provide GUI wrappers for GhostScript’s rather idiosyncratic invocation switches and command syntax.

Another excellent example of this pattern is the xcdroast/cdrtools combination. The cdrtools distribution provides a program cdrecord(1) with a command-line interface. The cdrecord code specializes in knowing everything about talking to CD-ROM hardware. xcdroast is a GUI; it specializes in providing a pleasant user experience. The xcdroast(1) program calls cdrecord(1) to do most of its work.


Figure 11.3. The Xcdroast GUI.

image

xcdroast also calls other CLI tools: cdda2wav(1) (a sound file converter) and mkisofs(1) (a tool for creating ISO-9660 CD-ROM file system images from a list of files). The details of how these tools are invoked are hidden from the user, who can think in terms centered on the task of making CDs rather than having to know directly about the arcana of sound-file conversion or file-system structure. Equally important, the implementers of each of these tools can concentrate on their domain-specific expertise without having to be user-interface experts.

A key pitfall of driver/engine organization is that frequently the driver must understand the state of the engine in order to reflect it to the user. If the engine action is practically instantaneous, it’s not a problem, but if the engine can take a long time (e.g., when accessing many URLs) the lack of feedback can be a significant issue. A similar problem is responding to errors. For example, the traditional (although not very Unix-like) confirmation question about whether it’s OK to overwrite a file that already exists is kind of painful to write in the driver/engine world; the engine, which detects the problem, has to ask the driver to do the confirmation prompting.

—Steve Johnson

It’s important to design the engine so that it not only does the right thing, but also notifies the driver about what it’s doing so the driver can present a graceful interface with appropriate feedback.

The terms “driver” and “engine” are uncommon but established in the Unix community.


#### 11.6.8.4 Client/Server Pair
A client/server pair is like a driver/engine pair, except that the engine part is a daemon running in background which is not expected to be run interactively, and does not have its own user interface. Usually, the daemon is designed to mediate access to some sort of shared resource—a database, or a transaction stream, or specialized shared hardware such as a sound device. Another reason for such a daemon may be to avoid performing expensive startup actions each time the program is invoked.

Yesterday’s paradigmatic example was the ftp(1)/ftpd(1) pair that implements FTP, the File Transfer Protocol; or perhaps two instances of sendmail(1), sender in foreground and listener in background, passing Internet email. Today’s would have to be any browser/web server pair.

However, this pattern is not limited to communication programs; another important case is in databases, such as the psql(1)/postmaster(1) pair. In this one, psql serializes access to a shared database managed by the postgres daemon, passing it SQL requests and presenting data sent back as responses.

These examples illustrate an important property of such pairs, which is that the cleanliness of the protocol that serializes communication between them is all-important. If it is well-defined and described by an open standard, it can become a tremendous opportunity for leverage by insulating client programs from the details of how the server’s resource is managed, and allowing clients and servers to evolve semi-independently. All separated-engine-and-interface programs potentially get this kind of benefit from clean separation of function, but in the client/server case the payoffs for getting it right tend to be particularly high exactly because managing shared resources is intrinsically difficult.

Message queues and pairs of named pipes can be and have been used for front-end/back-end communication, but the benefits of being able to run the server on a different machine from the client are so great that nowadays almost all modern client-server pairs use TCP/IP sockets.


#### 11.6.9 The CLI Server Pattern
It’s normal in the Unix world for server processes to be invoked by harness programs4 such as inetd(8) in such a way that the server sees commands on standard input and ships responses to standard output; the harness program then takes care of ensuring that the server’s stdin and stdout are connected to a specified TCP/IP service port. One benefit of this division of labor is that the harness program can act as a single security gatekeeper for all of the servers it launches.

4 A harness program is a wrapper whose job it is to make some special sort of resource available to the program(s) it calls. The term is most often used for test harnesses, which make available test loads and (often) examples of correct output for the actual output to be checked against.

One of the classic interface patterns is therefore a CLI server. This is a program which, when invoked in a foreground mode, has a simple CLI interface reading from standard input and writing to standard output. When backgrounded, the server detects this and connects its standard input and standard output to a specified TCP/IP service port.

In some variants of this pattern, the server backgrounds itself by default, and has to be told with a command-line switch when it should stay in foreground. This is a detail; the essential point is that most of the code neither knows nor cares whether it is running in foreground or a TCP/IP harness.

POP, IMAP, SMTP, and HTTP servers normally obey this pattern. It can be combined with any of the server/client patterns described earlier in this chapter. An HTTP server can also act as a harness program; the CGI scripts that supply most live content on the Web run in a special environment provided by the server where they can take input (form arguments) from standard input, and write the generated HTML that is their result to standard output.

Though this pattern is quite traditional, the term “CLI server” is my invention.


#### 11.6.10 Language-Based Interface Patterns
In Chapter 8 we examined domain-specific minilanguages as a means of pushing program specification up a level, gaining flexibility, and minimizing bugs. These virtues make the language-based CLI an important style of Unix interface—one exemplified by the Unix shell itself.

The strengths of this pattern are well illustrated by the case study earlier in the chapter comparing dc(1)/bc(1) with xcalc(1). The advantages that we observed earlier (the gain in expressiveness and scriptability) are typical of minilanguages; they generalize to other situations in which you routinely have to sequence complex operations in a specialized problem domain. Often, unlike the calculator case, minilanguages also have a clear advantage in concision.

One of the most potent Unix design patterns is the combination of a GUI front end with a CLI minilanguage back end. Well-designed examples of this type are necessarily rather complex, but often a great deal simpler and more flexible than the amount of ad-hoc code that would be necessary to cover even a fraction of what the minilanguage can do.

This general pattern is not, of course, unique to Unix. Modern database suites everywhere normally consist of one or more GUI front ends and report generators, all of which talk to a common back-end using a query language such as SQL. But this pattern mainly evolved under Unix and is still much better understood and more widely applied there than elsewhere.

When the front and back ends of a system fulfilling this design pattern are combined in a single program, that program is often said to have an ’embedded scripting language’. In the Unix world, Emacs is one of the best-known exemplars of this pattern; refer to our discussion of it in Chapter 8 for some advantages.

The script-fu facility of GIMP is another good example. GIMP is a powerful open-source graphics editor. It has a GUI resembling that of Adobe Photoshop. Script-fu allows GIMP to be scripted using Scheme (a dialect of Lisp); scripting through Tcl, or Perl or Python is also available. Programs written in any of these languages can call GIMP internals through its plugin interface. The demonstration application for this facility is a Web page5 which allows people to construct simple logos and graphic buttons through a CGI interface that passes a generated Scheme program to an instance of GIMP, and returns a finished image.

5 Script-Fu page <http://www.xcf.berkeley.edu/~gimp/script-fu/script-fu.html>.


### 11.7 Applying Unix Interface-Design Patterns
To facilitate scripting and pipelining (see Chapter 7) it is wise to choose the simplest interface pattern possible—that is, the pattern with the fewest channels to the environment and the least interactivity.

In many of the single-component patterns described above, it is emphasized that the pattern does not require user interaction after startup time. When the ’user’ is often expected to be another program (and thus to lack the range and flexibility of a human brain) this is a very valuable feature, maximizing scriptability.

We’ve seen that different interface design patterns optimize for traits valuable in differing circumstances. In particular, there is a strong and inherent tension between the GUIs and design patterns appropriate for novice and nontechnical end-users (on the one hand) and those which serve expert users and maximize scriptability (on the other).

One way around this dilemma is to make programs with modes that exhibit more than one pattern. An excellent example is the Web browser lynx(1). It normally has a roguelike interface for interactive use, but can be called with a -dump option that makes it into a source, formatting a specified Web page to text dumped on standard output.

Such dual-mode interfaces, however, are not normally attempted when the program has to have a true GUI. The reasons for this are partly historical, but mostly have to do with controlling global complexity. GUIs tend to require complex startup configurations and large volumes of specialized code; these features coexist uneasily with the simpler patterns. In the worst case, a dual-mode GUI/non-GUI program could require two separate command-interpreter loops, with all that implies in the way of code bloat and potential inconsistencies.

Thus, when “choose the simplest pattern” conflicts with a requirement to produce a GUI, the Unix way is to split the program in two, applying the ’separated engine and interface’ design pattern.

In fact, by combining a theme from Chapter 7 with this idea, we can perhaps name a new design pattern emerging under Linux and other modern, open-source Unixes where GUIs are not merely a reluctant add-on but an active focus of lots of development effort.


#### 11.7.1 The Polyvalent-Program Pattern
A polyvalent program has the following traits:

The program’s application-domain logic lives in a library with a documented API, which can be linked to other programs. The program’s interface logic to the rest of the world is a thin layer over the library. Or perhaps there are several layers with different UI styles, any of which the library can be linked to.
One UI mode is a cantrip, compiler-like or CLI pattern that executes its interactive commands in batch mode.
One UI mode is a GUI, either linked directly to the core library or acting as as a separate process driving the CLI interface.
One UI mode is a scripting interface using a modern general-purpose scripting language like Perl, Python, or Tcl.
Optional extra: One UI mode is a roguelike interface using curses(3).

Figure 11.4. Caller/callee relationships in a polyvalent program.

image

Notably, the GIMP actually fulfills this pattern.


### 11.8 The Web Browser as a Universal Front End
Separating your CLI back end from a GUI interface has become an even more attractive strategy since the transformation of computing by the World Wide Web in the mid-1990s. For a large class of applications, it makes increasing sense not to write a custom GUI front end at all, but rather to press Web browsers into service in that role.

This approach has many advantages. The most obvious is that you don’t have to write procedural GUI code—instead, you can describe the GUI you want in languages (HTML and JavaScript) that are specialized for it. This avoids a lot of expensive and complex single-purpose coding and often more than halves the total project effort. Another is that it makes your application instantly Internet-ready; the front end may be on the same host as the back end, or may be a thousand miles away. Yet another is that all the minor presentation details of the application (such as fonts and color) are no longer your back end’s problem, and indeed can be customized by users to their own tastes through mechanisms like browser preferences and cascading style sheets. Finally, the uniform elements of the Web interface substantially ease the user’s learning task.

There are disadvantages. The two most important are (a) the batch style of interaction that the Web enforces, and (b) the difficulties of managing persistent sessions using a stateless protocol. Though these are not exclusively Unix issues, we’ll discuss them here—because it’s very important to think clearly on the design level about when it’s worthwhile to accept or work around these constraints.

CGI, the Common Gateway Interface through which a browser can invoke a program on the server host, does not support fine-grained interactivity well. Nor do the templating systems, application servers, and embedded server scripts that are gradually replacing it (in a mild abuse of language, we will use CGI for all of these in this section).

You can’t do character-by-character or GUI-gesture-by-GUI-gesture I/O through a CGI gateway; instead, you have to fill out an HTML form and click a submit button that sends the form contents to a CGI script. The CGI script then runs and the server hands you back a page of HTML that it generated (which may itself be another CGI form).

This is essentially a batch style of interaction, not that far removed in concept from dropping punched cards in an input hopper and getting back a printout. It can be made more palatable by using JavaScript to interact with the user, batching up transactions into messages to be shipped to the server.

Java applets can open up their own character-stream connections back to the server to support smoother interactivivity. But Java has technical problems (it can only use a fixed display area on the page, and can’t change the portion of the display outside that rectangle) and much worse political ones (proprietary licensing from Sun has stalled Java deployment and made others reluctant to commit to it; you can’t count on every user’s browser to support it).

Both Java and JavaScript can run into browser incompatibilities, as well. Microsoft’s resistance to implementing JDK 1.2 and Swing on Internet Explorer is a serious problem for Java applets, and differing Javascript version levels can also break your application (though Javascript bugs are easier to fix). Nevertheless, it is frequently less effort to work around these problems than it would be to write and deploy a custom front end. A problem harder to work around is that a growing number of sophisticated users routinely disable Java and even JavaScript in their browsers because of security problems and interface abuses.

As an independent issue, it is tricky to maintain session information across multiple CGI forms. The server doesn’t keep any state about client sessions between CGI transactions, so you can’t rely on it to connect later form submissions with earlier ones by the same user. There are two standard dodges around this: chained forms and browser cookies.

When you chain forms, you arrange for the CGI for the first form to generate a unique ID in an invisible field of the second form, and for the second and all subsequent forms to pass that ID to their successors. Cookies give a similar effect in a less direct way analogous to environment variables (see any of the hundreds of books on CGI design for details). In either case, your CGI has to use the ID as a session index (or cookies to cache state directly) and to handle multiplexing the sessions explicitly.

It is often possible to live with these restrictions. Many nontrivial applications can fit into a single form and response, evading both problems. Even when this isn’t true and the application requires multiple forms, the complexity and cost savings from not having to build and distribute a specialized front end are so large that they can easily pay for the effort required to write CGIs smart enough to do their own session tracking.

The session management problem can be addressed with application servers like Zope or Enhydra which provide a session abstraction, and services like user authentication to programs embedded inside them. The drawback of these programs is identical to their advantage: the fact that they make it easier to keep per-user state on the server. That per-user state can be a problem; it eats resources, and it has to be timed out, because between transactions there is no way to know that the user is still on the other end of the wire.

As usual, the best advice is to choose the simplest pattern possible. Resist the temptation to do a heavyweight design relying on Java or an application server when simple CGIs and cookies will do the job.

One problem with the browser-as-universal-front-end approach is that CGI back ends aren’t readily separable from the browser environment, so it can be hard to script or automate transactions to the back end. The Unix answer is a three-tier architecture—Web forms calling CGIs which call commands. The automation interface is the commands.

The way that browsers decouple front and back ends has larger implications. On the Web, locking in consumers to closed, proprietary protocols and APIs has become more difficult and less attractive as this trend has advanced. The economics of software development are therefore tilting toward HTML, XML, and other open, text-based Internet standards. This trend synergizes in interesting ways with the evolution of the open-source development model, which we’ll survey in Chapter 19. In the world that the Web is creating, Unix’s design tradition—including the approaches to interface design we’ve surveyed in this chapter—looks more at home than ever before.


### 11.9 Silence Is Golden
We cannot leave the subject of interactive user interfaces without exploring one of the oldest and most persistent design tropes of Unix, the Rule of Silence. We observed in Chapter 1 that well-designed Unix programs with nothing interesting or surprising to say should shut up, and suggested there are good reasons for this that have long outlasted the slow teletypes on which Unix was born.

Here’s one: Programs that babble don’t tend to play well with other programs. If your CLI program emits status messages to standard output, then programs that try to interpret that output will be put to the trouble of interpreting or discarding those messages (even if nothing went wrong!). Better to send only real errors to standard error and not to emit unrequested data at all.

Here’s another: The user’s vertical screen space is precious. Every line of junk your program emits is one less line of context still available on the user’s display.

Here’s a third: Junk messages are a careless waste of the human user’s bandwidth. They’re one more source of distracting motion on a screen display that may be mediating for more important foreground tasks, such as communication with other humans.

Go ahead and give your GUIs progress bars for long operations. That’s good style—it helps the user time-share his brain efficiently by cuing him that he can go off and read mail or do other things while waiting for completion. But don’t clutter GUI interfaces with confirmation popups except when you have to guard operations that might lose or trash data—and even then, hide them when the parent window is minimized, and bury them unless the parent window has focus.6 Your job as an interface designer is to assist the user, not to gratuitously get in his face.

6 If your windowing system supports translucent popups that intrude less between the user and the application, use them.

In general, it’s bad style to tell the user things he already knows (“Program <foo> is starting up...”, or “Program <foo> is exiting” are two classic offenders). Your interface design as a whole should obey the Rule of Least Surprise, but the content of messages should obey a Rule of Most Surprise—be chatty only about things that deviate from what’s normally expected.

This rule has even greater force for confirmation prompts. Constantly asking for confirmation where the answer is almost always “yes” conditions the user to press “yes” without thinking about it, a habit that can have very unfortunate consequences. Programs should request confirmation only when there is good reason to suspect that the answer might be “no no no!” A confirmation request that is not a surprise is a strong hint of bad design. Any confirmation prompts at all may be a sign that what your interface really needs is an undo command.

If you want chatty progress messages for debugging purposes, disable them by default with a verbosity switch. Before releasing for production, relegate as many of the normal messages as possible to being displayed only when the verbosity switch is on.

## 12. Optimization

Premature optimization is the root of all evil.

—C. A. R. Hoare

This is going to be a very short chapter, because the main thing Unix experience teaches us about optimizing for performance is how to know when not to do it. A secondary lesson is that the most effective optimization tactics are usually things we do for other reasons, such as cleanness of design.


### 12.1 Don’t Just Do Something, Stand There!
The most powerful optimization technique in any programmer’s toolbox is to do nothing.

This very Zen advice is true for several reasons. One is the exponential effect of Moore’s Law—the smartest, cheapest, and often fastest way to collect performance gains is to wait a few months for your target hardware to become more capable. Given the cost ratio between hardware and programmer time, there are almost always better things to do with your time than to optimize a working system.

We can get mathematically specific about this. It is almost never worth doing optimizations that reduce resource use by merely a constant factor; it’s smarter to concentrate effort on cases in which you can reduce average-case running time or space use from O(n2) to O(n) or O(n log n),1 or similarly reduce from a higher order. Linear performance gains tend to be rapidly swamped by Moore’s Law.2

1 For readers unfamiliar with O notation, it is a way of indicating how the average running time of an algorithm changes with the size of its inputs. An O(1) algorithm runs in constant time. An O(n) algorithm runs in a time that is predicted by An + C, where A is some unknown constant of proportionality and C is an unknown constant representing setup time. Linear search of a list for a specified value is O(n). An O(n2) algorithm runs in time An2 plus lower-order terms (which might be linear, or logarithmic, of any other function lower than a quadratic). Checking a list for duplicate values (by the naïve method, not sorting it) is O(n2). Similarly, O(n3) algorithms have an average run time predicted by the cube of problem size; these tend to be too slow for practical use. O(log n) is typical of tree searches. Intelligent choice of algorithm can often reduce running time from O(n2) to O(log n). Sometimes when we are interested in predicting an algorithm’s memory utilization, we may notice that it varies as O(1) or O(n) or O(n2); in general, algorithms with O(n2) or higher memory utilization are not practical either.

2 The eighteen-month doubling time usually quoted for Moore’s Law implies that you can collect a 26% performance gain just by buying new hardware in six months.

Another very constructive form of doing nothing is to not write code. The program can’t be slowed down by code that isn’t there. It can be slowed down by code that is there but less efficient than it could be—but that’s a different matter.


### 12.2 Measure before Optimizing
When you have real-world evidence that your application is too slow, then (and only then) is the time to think about optimizing the code. But before you do more than think about optimizing, measure.

Recall Rob Pike’s six rules in Chapter 1. One of the lessons that the original Unix programmers learned early is that intuition is a poor guide to where the bottlenecks are, even for one who knows the code in question intimately. Unixes, unlike most other operating systems, usually come with profilers; use them.

Reading profiler results is something of an art. There are a couple of recurring problems: one is instrumentation noise, another is the effect of imposed external latencies, and a third is overweighting of upper nodes in the call graph.

The instrumentation-noise problem is fundamental. Profilers work by inserting instructions that report execution time at the entry and exit points of subroutines, also at fixed intervals within the inline code of routines. These instructions themselves take time to execute. The effect is to reduce the dispersion of call times: very short subroutines tend to look more expensive than they are, with a lot of noise in their comparative call times, while for longer ones the instrumentation overhead is invisible.

Bearing instrumentation noise in mind, it’s wise to assume that the times listed for the fastest, shortest subroutines are going to have a lot of froth and air in them. They can still be eating a lot of time if they are called very frequently, however, so pay particular attention to their call-count statistics.

The external-latency problem is also fundamental. There are various sorts of delay and distortion that can happen behind the profiler’s back. The simplest is overhead from operations with unpredictable latency—disk and network accesses, cache fills, process-context switches, and the like. The problem is not so much that these overheads happen—they may actually be what you’re trying to measure, especially if you’re focusing on whole-system performance rather than just tuning a critical inner loop. The problem is that they have a random component that means the results from any individual profiling run may not be very useful.

One way to minimize the effects of these noise sources, and get a better picture of where the time is going in the average case, is to add together the results from a lot of profiling runs. There are a lot of good reasons to build test harnesses and test loads for your programs before you get to optimizing; the most important reason, usually far more important than performance tuning, is so you can regression-test your program for correctness as you change it. Once you’ve done this, being able to profile repeated tests under load is a nice side effect that will often give you better information than a few runs by hand.

Various effects tend to allocate time spent to calling routines rather than callees, overweighting upper modes in the call graph. Function-call overhead, for example, is often charged to the calling routine (whether or not this is true depends partly on your machine architecture and where the profiler is allowed to insert probes). Macros and inline functions, if your compiler supports them, won’t show up in the profiling report at all; every bit of their time gets charged to the calling function.

More importantly, many time-reporting tools give a display in which time spent in subroutines is charged to the caller. (The gprof(1) profiler distributed with open-source Unixes has this trait.) Naïvely subtracting callee time from caller time won’t give you a useful result if the same routine can have more than one caller—the effect would be to artificially deflate both callers’ times. Especially nasty is the common case of a utility function with multiple call sites, some of which make lots of trivial calls and others of which make a few complicated ones.

To get more transparent results, factor your code so that upper-level routines consist as much as possible of calls to lower-level routines, rather than in-line code. If you keep the overhead of upper-level control logic to a minimum, the call structure of the code will tend to organize the profile report in a way that is relatively easy to read.

You’ll get more insight from using profilers if you think of them less as ways to collect individual performance numbers, and more as ways to learn how performance varies as a function of interesting parameters (e.g., problem size, CPU speed, disc speed, memory size, compiler optimization, or whatever else is relevant). Try fitting those numbers to a model, using open-source software like R or a good-quality proprietary tool like MATLAB.

The natural smoothing of the data that results from model fitting tends to focus on the big effects and cover up the small, noisy ones. For example, by fitting a cubic to the matrix inversion routine in MATLAB on random matrices from 10 × 10 to 1000 × 1000, it is clear that we actually have three cubics, with clearly defined boundaries, that correspond roughly to “in cache”, “in memory but out of cache”, and “out of memory”. The data shows us this effect even if weren’t looking for it, just by looking at the deviations from the best fit.

—Steve Johnson


### 12.3 Nonlocality Considered Harmful
The most effective way to optimize your code is to keep it small and simple. We’ve been through lots of good reasons to keep it small and simple earlier in this book. Here’s a new one: you want the central data structures and the time-critical loops in your code never to fall out of cache.

Consider your target machine as a hierarchy of memory types arranged by distance from the processor. There are the processor’s own registers; its instruction pipeline; the level-one (L1) cache; the level-two (L2) cache; possibly a level-three (L3) cache; main memory (what Unix old hands still quaintly call ’core’); and the disk drives where swap space lives. Technologies like SMP, shared-memory clusters, and non-uniform memory access (NUMA) add more layers to the picture but only widen the overall spread.

Every kind of access to that stack is getting faster. Processor cycles are almost free, outside of a few demanding applications like modeling nuclear explosions or real-time video compression. But what’s also happening is that the speed ratios between layers in the storage hierarchy are all increasing as processor speeds go up. Thus, the relative cost of a cache miss is increasing.

So we have an interesting paradox. As machine resources plummet, the expected cost of large data structures falls—but because the cost spread between adjacent cache levels is also going up, the performance impact of being just large enough to break a cache boundary is also rising.

“Small is beautiful” is therefore better advice than ever, particularly with regard to central data structures that must live in the fastest possible cache. The advice applies to code as well; the average instruction spends more time being loaded than it does executing.

This turns some traditional advice on its head. Compiler optimizations like loop unrolling, which get rid of relatively expensive machine instructions in return for an increase in total code size, may no longer be worth doing. Another example is precomputing small tables—for example, a table of sin(x) by degree for optimizing rotations in a 3D graphics engine will take 365 × 4 bytes on a modern machine. Before processors got enough faster than memory to demand caching, this was an obvious speed optimization. Nowadays it may be faster to recompute each time rather than pay for the percentage of additional cache misses caused by the table.

But in the future, this might turn around again as caches grow larger. More generally, many optimizations are temporary and can easily turn into pessimizations as cost ratios change. The only way to know is to measure and see.


### 12.4 Throughput vs. Latency
Another effect of fast processors is that performance is usually bounded by the cost of I/O and—especially with programs that use the Internet—network transactions. It’s therefore valuable to know how to design network protocols for good performance.

The most important issue is avoiding protocol round trips as much as possible. Every protocol transaction that requires a handshake turns any latency in the connection into a potentially serious slowdown. Avoiding such handshakes is not specifically a Unix-tradition practice, but it’s one that needs mention here because so many protocol designs lose huge amounts of performance to them.

I cannot say enough about latency. X11 went well beyond X10 in avoiding round trip requests: the Render extension goes even further. X (and these days, HTTP/1.1) is a streaming protocol. For example, on my laptop, I can execute over 4 million 1×1 rectangle requests (8 million no-op requests) per second. But round trips are hundreds or thousands of times more expensive. Anytime you can get a client to do something without having to contact the server, you have a tremendous win.

—Jim Gettys

In fact, a good rule of thumb is to design for the lowest possible latency and ignore bandwidth costs until your profiling tells you otherwise. Bandwidth problems can be solved later in development by tricks like compressing a protocol stream on the fly; but getting rid of high latency baked into an existing design is much, much harder (often, effectively impossible).

While this effect shows up most clearly in network protocol design, throughput vs. latency tradeoffs are a much more general phenomenon. In writing applications, you will sometimes face a choice between doing an expensive computation once in anticipation that it will be used several times, or computing only when actually needed (even if that means you will often recompute results). In most cases where you face a tradeoff like this, the right thing to do is bias toward low latency. That is, don’t try to precompute expensive operations unless you have a throughput requirement and know by actual measurement that the throughput you are getting is too low. Precomputation may seem efficient because it minimizes total use of processor cycles, but processor cycles are cheap. Unless you are doing one of a handful of monstrously compute-intensive applications like data mining, animation rendering, or the aforementioned bomb simulations, it is usually better to opt for short startup times and quick response.

In Unix’s early days this advice might have been considered heretical. Processors were much slower and cost ratios were very different then; also, the pattern of Unix use was tilted rather more strongly toward server operations. The point about the value of low latency needs to be made partly because even newer Unix developers sometimes inherit an old-time cultural prejudice toward optimizing for throughput. But times have changed.

Three general strategies for reducing latency are (a) batching transactions that can share startup costs, (b) allowing transactions to overlap, and (c) caching.


#### 12.4.1 Batching Operations
Graphics APIs are frequently written on the assumption that the fixed setup cost for a physical screen update is large. Consequently, the write operations actually modify an internal buffer. It is up to the programmer to decide when enough of these updates have been batched and to issue the call that turns them into a physical screen update. Picking the right spacing of physical updates can make a great deal of difference to the feel of the graphics client. Both the X server and the curses(3) library used by roguelike programs are organized in this way.

Persistent service daemons are a more Unix-specific example of batching. There are two reasons, one obvious and one subtle, to write persistent daemons (as opposed to CLI servers that are started up fresh for each session). The obvious reason is to manage updates to a shared resource. The less obvious reason, which obtains even for daemons that don’t handle updates, is to amortize the cost of reading in the daemon’s database across multiple requests. A perfect example of this is the DNS service daemon named(8), which must sometimes handle thousands of requests per second, each one of which may actually be blocking a user’s Web page load. One of the tactics that makes named(8) fast is that it replaces parses of expensive on-disk text files describing DNS zones with accesses to a cache held in memory.


#### 12.4.2 Overlapping Operations
In Chapter 5 we compared the POP3 and IMAP protocols for querying remote-mail servers. We noted that IMAP requests (unlike POP3 requests) are tagged with a request identifier generated by the client; the server, when it ships back a response, includes the tag of the request it pertains to.

POP3 requests have to be processed in lockstep by both client and server; the client sends a request, waits for the response to that request, and only then can prepare and ship the next one. IMAP requests, on the other hand, are are tagged so they can be overlapped. If an IMAP client knows that it wants to fetch multiple messages, it can stream several fetch requests (each with a different tag) to the IMAP server, without waiting for responses between them. Responses, each tagged, will come back when the server is ready; responses to early requests may come in while the client is still shipping later ones.

This strategy is general to more areas than network protocols. If you want to cut latency, blocking or waiting on intermediate results is deadly.


#### 12.4.3 Caching Operation Results
Sometimes you can get the best of both worlds (low latency and good throughput) by computing expensive results as needed and caching them for later use. Earlier we mentioned that named reduces latency by batching; it also reduces latency by caching the results of previous network transactions with other DNS servers.

Caching has its own problems and tradeoffs, which are well illustrated by one application: the use of binary caches to eliminate parsing overhead associated with text database files. Some variants of Unix have used this technique to speed up access to their password information (the usual motivation was to cut latency on logins at very large sites).

To make this work, all code that looks at the binary cache has to know that it should check the timestamps on both files and regenerate the cache if the text master is newer. Alternatively, all changes to the textual master must be made through a wrapper that will update the binary format.

While this approach can be made to work, it has all the disadvantages that the SPOT rule would lead us to expect. The duplication of data means that it doesn’t yield any economy of storage—it’s purely a speed optimization. But the real problem with it is that the code to ensure coherency between cache and master is notoriously leaky and bug-prone. Very frequently updated cache files can lead to subtle race conditions simply because of the 1-second resolution of timestamps.

Coherency can be guaranteed in simple cases. One such is the Python interpreter, which compiles and deposits on disk a p-code file with extension .pyc when a Python library file is first imported. On subsequent runs the cached copy of the p-code is loaded unless the source has since changed (this avoids reparsing the library source code on every run). Emacs Lisp uses a similar technique with .el and .elc files. This technique works because both read and write accesses to the cache go through a single program.

When the update pattern of the master is more complex, however, the synchronization code tends to spring leaks. The Unix variants that used this technique to speed up access to critical system databases were infamous for spawning system-administrator horror stories that reflected this.

In general, binary cache files are a brittle technique and probably best avoided. The work that went into implementing a special-purpose hack to reduce latency in this one case would have been better spent improving the application design so it doesn’t have a bottleneck there—or even on tuning to improve the speed of the file system or the virtual-memory implementation.

When you think you are in a situation that demands caching, it is wise to look one level deeper and ask why the caching is necessary. It may well be no more difficult to solve that problem than it would be to get all the edge cases in the caching software right.

## 13. Complexity: As Simple As Possible, but No Simpler

Everything should be made as simple as possible, but no simpler.

—Albert Einstein

At the end of Chapter 1, we summarized the Unix philosophy as “Keep It Simple, Stupid!” Throughout the Design section, one of the continuing themes has been the importance of keeping designs and implementations as simple as possible. But what is “as simple as possible”? How do you tell?

We’ve held off on addressing this question until now because understanding simplicity is complicated. It needs some of the ideas we developed earlier in the Design section, especially in Chapter 4 and Chapter 11, as background.

The large questions in this chapter are central preoccupations of the Unix tradition, some of them motivating holy wars that have simmered for decades. This chapter starts from established Unix practice and vocabulary, then goes a bit further beyond it than we do in the rest of the book. We don’t try to develop simple answers to these questions, because there aren’t any—but we can hope that you will walk away with better conceptual tools for developing your own answers.


### 13.1 Speaking of Complexity
As with previous issues about modularity and interface design, Unix programmers react to a set of distinctions they have often learned from experience without knowing how to articulate. Therefore we’ll need to start by developing some terminology.

We will start by defining what software complexity is. We will make some horizontal distinctions between different flavors of complexity, which sometimes have to be traded off against each other. We will finish by making some even more important vertical distinctions, between the kinds of complexity we must live with and the kinds we have the option to eliminate.


#### 13.1.1 The Three Sources of Complexity
Questions about simplicity, complexity, and the right size of software arouse a lot of passion in the Unix world. Unix programmers have learned a view of the world in which simplicity is beauty is elegance is good, and in which complexity is ugliness is grotesquery is evil.

Underlying the Unix programmer’s passion for simplicity is a pragmatic fact: complexity costs. Complex software is harder to think about, harder to test, harder to debug, and harder to maintain—and above all, harder to learn and use. The costs of complexity, rough as they are during development, bite hardest after deployment. Complexity creates places for bugs to nest, from which they will emerge to trouble the world through the entire lifetime of their software.

All kinds of pressures tend to drag programmers into a swamp of complexity nevertheless. We’ve examined a rogue’s gallery of these in earlier chapters; feature creep and premature optimization are the two most notorious. Traditionally, Unix programmers push back against these tendencies by proclaiming with religious fervor a rhetoric that condemns all complexity as bad.

So what exactly do we mean by ’complexity’? This point is worth pinning down, because it varies by observer.

Unix programmers (like other programmers) tend to focus on implementation complexity—basically, the degree of difficulty a programmer will experience in attempting to understand a program so he or she can mentally model or debug it.

Customers and users, on the other hand, tend to see complexity in terms of the program’s interface complexity. In Chapter 11 we discussed the quality of ease and its inverse, mnemonic load. To a user, complexity correlates closely with mnemonic load. Poor expressiveness and concision can matter too, if a weak interface forces the user to perform lots of error-prone or merely tedious low-level operations rather than a few high-level ones.

Driven by both of these is a third measure that is much simpler: the total number of lines of code in the system, its codebase size. In terms of life-cycle costs, this is usually the most important measure. The reasons go back to perhaps the most important empirical result in software engineering, one we’ve cited before: the defect density of code, bugs per hundred lines, tends to be a constant independent of implementation language. More lines of code means more bugs, and debugging is the most expensive and time-consuming part of development.

Codebase size, interface complexity and implementation complexity may all rise together. That is the usual result of feature creep, and why programmers especially dread it. Premature optimization doesn’t tend to raise interface complexity, but it has bad effects (often severely bad) on implementation complexity and codebase size. But those sorts of arguments against complexity are relatively easy to win; the difficult ones begin when these three measures have to be traded off against each other.

We’ve already mentioned one situation in which two measures vary in opposite directions: a user interface that has been designed primarily to preserve implementation simplicity, or keep codebase size down, may simply dump low-level tasks on the user. (A crude example of this, barely imaginable to a Unix programmer but all too common elsewhere, might be an editor that lacked a global-replace feature.) Though this sort of design failure is all too common, it does not traditionally have a name. We’ll call it a manularity trap.

Pressure to keep the codebase size down by using extremely dense and complicated implementation techniques can cause a cascade of implementation complexity in the system, leading to an un-debuggable mess. This used to happen frequently when fitting programs onto very small systems demanded assembler programming or tricks like self-modifying code; nowadays it is uncommon except in embedded systems, and rapidly becoming rare even there. This kind of design failure doesn’t have a traditional name, but one might call it a blivet trap, after an old Army term for the results of attempting to stuff ten pounds of horse manure into a five-pound bag.

The blivet trap won’t appear in our case studies, but we’ve defined it for contrast with its opposite. It can happen that the designers of a project are so wary of implementation complexity that they reject a complex but unified way to solve a whole class of problems in favor of lots of duplicative, ad-hoc code that solves each individual one in turn. The result is bloat in the size of the codebase, and maintainability problems more severe than if the unified method had been accepted. For example, a Web project that really needs a centralized relational database behind its pages might instead spawn several different keyed data files containing information that has to be reintegrated at page generation time. This sort of failure is all too common. It doesn’t have a traditional name; we’ll call it an adhocity trap.

These are the three faces of complexity, and some of the traps designers fall into in attempts to avoid them.1 We’ll see more examples when we get to the case studies later in the chapter.

1 The terms we have invented for these design traps, unlikely as they may sound, come from established hacker jargon described in [Raymond96].


#### 13.1.2 Tradeoffs between Interface and Implementation Complexity
One of the most perceptive observations ever made about the Unix tradition by someone standing outside it was contained in Richard Gabriel’s paper called Lisp: Good News, Bad News, and How to Win Big [Gabriel]. Gabriel is a long-time leader of the Lisp community, and the paper was primarily an argument for a particular style of Lisp design, but the author himself acknowledges that it is now remembered primarily for the section called ’The Rise of Worse Is Better’.

The paper argued that Unix and C have the characteristics of viruses, and that in the evolutionary struggle among software designs traits like implementation simplicity and portability which lead to rapid propagation (infectiousness) are more effective than correctness and completeness of the design. Gabriel came so close to anticipating the ’many-eyeballs’ effect on open-source software that the open-source community retrospectively adopted him as one of its theorists after 1997.

Less remembered is that the Gabriel’s central argument was about a very specific tradeoff between implementation and interface complexity, one which rather exactly fits the categories we have examined in this chapter. Gabriel contrasts an ’MIT’ philosophy most valuing interface simplicity with a ’New Jersey’ philosophy most valuing implementation simplicity. He then proposes that although the MIT philosophy leads to software that is better in the abstract, the (worse) New Jersey model has better propagation characteristics. Over time, people pay more attention to software written in the New Jersey style, so it improves faster. Worse becomes better.

In fact, the MIT and New Jersey philosophies have analogs as conflicting tendencies within the Unix design tradition itself. One strain of Unix thinking emphasizes small sharp tools, starting designs from zero, and interfaces that are simple and consistent. This point of view has been most famously championed by Doug McIlroy. Another strain emphasizes doing simple implementations that work, and that ship quickly, even if the methods are brute-force and some edge cases have to be punted. Ken Thompson’s code and his maxims about programming have often seemed to lean in this direction.

The tension between these approaches arises precisely because one can sometimes get a simpler interface if one is willing to pay implementation complexity for it, or vice versa. Gabriel’s original example, about how system calls that do long operations handle interrupts they cannot hold or mask, is still one of the best. Under the MIT philosophy, the right thing to do would be to back out of the system call and automatically resume it once the interrupt has been handled; this is harder to implement but leads to a simpler interface. Under the New Jersey philosophy, the system call would return an error indicating that it has been interrupted and the user must reexecute; this can be implemented far more simply, but leads to a programming interface that is more difficult to use.

Both approaches have been tried. Old Unix hands will instantly think of System-V-style vs. BSD-style handling of software signals; the latter follows the MIT philosophy, while the former hails from New Jersey. Underlying the choice between them is a pressing question that has nothing directly to do with the software’s infectiousness: if your goal is to hold down total global complexity, where are you most willing to pay to do that? Where should you be most willing to pay?

One epochal example not mentioned in Gabriel’s paper is from distributed hypertext systems. Early distributed-hypertext projects such as NLS and Xanadu were severely constrained by the MIT-philosophy assumption that dangling links were an unacceptable breakdown in the user interface; this constrained the systems to either browsing only a controlled, closed set of documents (such as on a single CD-ROM) or implementing various increasingly elaborate replication, caching, and indexing methods in an attempt to prevent documents from randomly disappearing. Tim Berners-Lee cut through this Gordian knot by punting the problem in classic New Jersey style. The simplicity of implementation he bought by allowing “404: Not Found” as a response was what made the World Wide Web lightweight enough to propagate and succeed.

Gabriel himself, while sticking with the observation that ’worse’ is more infectious and tends to win in the end, has publicly changed his mind several times about the underlying complexity-related question of whether or not this is actually a good thing. His uncertainty mirrors a lot of ongoing design debates within the Unix community.

We cannot offer a one-size-fits-all answer. As with most of the large questions in this chapter, good taste and engineering judgement will demand different answers in different situations. The important thing is to develop the habit of thinking carefully about this issue on each and every one of your designs. As we have observed before in discussing software modularity, complexity is a cost you must budget very carefully.


#### 13.1.3 Essential, Optional, and Accidental Complexity
In an ideal world, Unix programmers would craft only small, perfect gems of software, each minimal, each elegant, each perfect. But one of the unfortunate things about reality is that it often poses complex problems that demand complex solutions. You can’t control a jetliner with an elegant ten-line procedure. There are too many pieces of equipment, too many channels and interfaces, too many different processors—too many different subsystems defined by independently operating human beings who often don’t agree even on fundamental conventions. Even if you are successful at making all the individual software parts of an avionics system elegant, integration is likely to produce a large, complex, and grubby body of code with (one hopes) the single virtue that it will actually work.

Jetliners have essential complexity. There is a rather sharp point past which it’s not possible to trade away features for simplicity, because the plane has to stay in the air. Because of that very fact, avionics control systems do not tend to spawn religious wars about complexity—and Unix programmers tend to stay away from them.

Jetliners are certainly not immune from system failures due to overcomplexity. But the design issues are easier to discern and think about in software for which the requirements are more flexible, in which it is easy to trade off between anticipated features and complexity. (Here, and in the rest of this chapter, we will use ’feature’ in a very general sense that includes things like performance gains or overall degree of interface polish.)

To sharpen our vision, we need to begin by noticing a difference between accidental complexity and optional complexity.2 Accidental complexity happens because someone didn’t find the simplest way to implement a specified set of features. Accidental complexity can be eliminated by good design, or good redesign. Optional complexity, on the other hand, is tied to some desirable feature. Optional complexity can be eliminated only by changing the project’s objectives.

2 The distinction between accidental and optional complexity means that the categories we’re discussing here are not the same as essence and accident in Fred Brooks’s essay No Silver Bullet [Brooks], but they have common ancestry in philosophy.

When we fail to distinguish between optional and accidental complexity, design debates become seriously confused. Questions about what a project’s objectives are get confused with questions about the aesthetics of simplicity, and whether people have been sufficiently clever.


#### 13.1.4 Mapping Complexity
So far, we’ve developed two different scales for thinking about complexity. These scales are actually orthogonal to each other. Figure 13.1 may help clarify the relationships. Each of the nine boxes of the figure lists a common source of a particular kind of complexity.


Figure 13.1. Sources and kinds of complexity.

image

We’ve touched on some of these varieties of complexity earlier in this book, especially the accidental ones. In Chapter 4 we saw that accidental interface complexity often comes from non-orthogonality in the interface design—that is, failing to carefully factor the interface operations so that each does exactly one thing. Accidental code complexity (making code more complicated than it needs to be to get the job done) often results from premature optimization. Accidental codebase bloat often results from violating the SPOT rule, duplicating code or organizing it poorly so that opportunities for reuse aren’t recognized.

Essential interface complexity usually can’t be cut without trimming the basic functional requirements for the software (a theme we’ll develop further in this chapter’s case studies). Essential codebase size is related to choice of development tools because, if the feature list is held constant, the most important factor in codebase size is probably the choice of implementation language (as we implied in Chapter 8).

Sources of optional complexity are the most difficult to make useful generalizations about, because they so often depend on delicate judgments about which features it is worth paying the complexity cost for. Optional interface complexity often comes from adding convenience features that make life easier for users but aren’t essential to the function of the program. Optional increases in codebase size (supposing the user-visible features and the algorithms used are held constant) can often come from various sorts of practices intended to make it more maintainable—adding mode comments, using long variable names, and so forth. Optional implementation complexity tends to be driven by everything that touches a project.

The sources of complexity have to be grappled with in different ways. Codebase size can be attacked with better tools. Implementation complexity can be addressed with better choice of algorithms. Interface complexity has to be addressed with better interaction design, a skill involving considerations of ergonomics and user psychology. This skill is less common (and possibly more difficult) than writing code.

Attacking the kinds of complexity, on the other hand, has to be done more with insight than with methods. You cut accidental complexity by noticing that there is a simpler way to do things. You cut optional complexity by making context-dependent judgments about what features are worthwhile. You can only cut essential complexity by having an epiphany, fundamentally redefining the problem you are addressing.


#### 13.1.5 When Simplicity Is Not Enough
The failure mode that goes with the Unix tradition’s insistence on simplicity is that Unix programmers often talk (and sometimes even behave) as though all optional complexity is accidental. More than this, there is a strong bias in the Unix tradition toward removing features rather than accepting optional complexity.

The case for this attitude is easy to make (indeed, we spend much of this book making it). Clean minimalism makes us feel virtuous on many levels, and designing for it is a valuable counter to the natural tendency of software systems to develop ever-more-elaborate encrustations of ill-considered features. But computing resources and human thinking time, like wealth, find their justification not in being hoarded but in being spent. As with other forms of asceticism, one has to ask when design minimalism stops being a valuable form of self-discipline and starts being a mere hair shirt—a way to indulge those feelings of virtue at the expense of actually using that wealth to get work done.

This is a perilous question, all too easily turned into an argument for abandoning good design discipline altogether. Unix old hands often shy away from it, fearing that failing to hold the hardest possible line against complexity and bloat will lead us inexorably to damnation. But it’s also a necessary question. We’ll tackle it directly when analyzing this chapter’s case studies.


### 13.2 A Tale of Five Editors
Now we’re going to use five different Unix editors as case studies. It will be helpful to bear in mind a set of benchmark tasks as we examine these designs:

• Plain-text editing. Manipulating plain ASCII (or, in this internationalized age, perhaps Unicode) files with no structure known to the editor above byte level, or perhaps line level.

• Rich-text editing. Editing of text with attributes; these might include font changes, color, or other sorts of properties of text spans (such as being a hyperlink). Editors that can do this have to be able to translate between some presentation of the attributes in the user interface and some on-disk representation of the data (such as HTML, XML, or other rich-text formats.)

• Syntax awareness. An editor that is syntax-aware knows that input events have a grammar, and does things like automatically changing the indent level when it recognizes the beginning or end of a block scope in a programming language. Editors that are syntax-aware also commonly highlight syntax with colors or distinguished fonts.

• Output parsing of batch command output. The commonest case of this in the Unix world is running a C compilation from inside the editor, trapping the error messages, and then being able to step through the error locations without leaving the editor.

• Interaction with helper subprocesses that persist and maintain state between editor commands. This capability, when present, has powerful consequences:

• It’s possible to drive a version-control system from inside the editor, performing file checkins and checkouts without dropping out to a shell window or separate utility.

• It’s possible to front-end a symbolic debugger inside the editor, such that (for example) when the run stops on a breakpoint the appropriate file and line is automatically visited.

• It’s possible to edit remote files within the editor, by having it recognize when a filename refers to another host (recognizing some syntax like /user@host:/path/to-file). Provided you have the right access, such an editor can automatically run a utility like scp(1) or ftp(1) to fetch a local copy, then automatically copy the edited version back to the remote location at file-save time.

All our case studies can edit plain text. (The reader should not take this capability for granted—there are many things called editors, such as ’word processors’ that are too specialized to do this!) We begin seeing variable degrees of optional complexity in how they handle the more complex tasks.


#### 13.2.1 ed
ed(1) is the truly Unix-minimalist way of plain-text editing. It dates from the days of teletypes.3 It has a simple, austere CLI, and there is no screen display. In the following listing, computer output is emphasized.

3 Younger readers may not be aware that terminals used to print. On paper. Very slowly.

images

Unbelievable as it may seem to a modern reader, most of Unix’s original code was written with this editor. The reader with DOS experience may recognize here the original on which EDLIN was (crudely) modeled.

If one defines the job of an editor simply as enabling the user to create and modify plain text files, ed(1) is entirely sufficient for the job. Importantly to the Unix view of design correctness, it does nothing else. Many old-school Unix programmers half-seriously maintain that all editors with more features than ed has are simply bloated—and a few still who seriously believe this.

Appropriately, ed was Ken Thompson’s deliberate simplification of the earlier qed[RitchieQED] editor—which was very similar (and the first editor to use regular expressions in the characteristic Unix way) but had multiple-buffer capability that Ken deliberately discarded. He judged it not worth the additional complexity.

A notable characteristic of ed(1) and all its descendants is the object-operation format of its commands (the session example shows an explicit range on the ’p’ command). There is a relatively powerful syntax for specifying line ranges, either numerically, or by regular-expression pattern match, or by special shorthands for the current and last line. Most editor operations can be applied to any range. This is a good example of orthogonality.

Nowadays, ed(1) is primarily used as a program-driven editing tool in scripts—a role to which editors with more elaborate modes of interactivity are unsuited. There is a close variant called ex(1) which adds a few useful interactivity features such as command prompts; it is occasionally useful in rare cases when editing must be done over a slow serial line, or in certain unusual crash-recovery situations where the library support needed to run other editors is not accessible. For these reasons, every Unix includes an ed implementation and most include ex as well.

The sed(1) stream editor mentioned in Chapter 9 is also closely related to ed; many of the basic commands are the same, though designed to be invoked through command-line switches rather than from standard input.

Almost all Unix programmers have strayed from the path of austerity and minimalist virtue enough to normally use editors that at least present a roguelike, screen-oriented interface. However, the fact that the religion of ed persists4 says a great deal that is worth noting about the Unix mindset.

4 The religion of ed is exemplified by a famous Usenet posting which the reader may be able to find with a Web search for “Ed is the standard editor”. While it is clearly intended as parody, it is by no means clear that the author was entirely joking. Most Unix hackers would read it as an example of “Ha ha, only serious”.


#### 13.2.2 vi
The original vi(1) editor was the first attempt to bolt a visual, roguelike interface onto the command set of ed(1). Like ed, its commands are generally single keystrokes, and it is particularly well suited to use by touch-typists.

The original vi didn’t have mouse support, editing menus, macros, assignable key bindings, or any form of user customization. In line with the religion of ed, vi’s partisans considered the lack of these features a virtue. On this view, one of vi’s most important virtues is that you can start editing immediately on a new Unix system without having to carry along your customizations or worrying that the default command bindings will be dangerously different from what you’re used to.

One characteristic of vi that beginners tend to find frustrating is a result of its terse single-keystroke commands. It has a moded interface—you are either in command mode or in text-insertion mode. In text-insertion mode, the only commands that work are the ESC key for mode exit and (on newer versions) the cursor-movement keys. In command mode, typing text will be interpreted as commands and do odd (and probably destructive) things to your content.

On the other hand, one property of the command set that vi fans particularly tout is the object-operation format it inherited from ed. Most of the extended commands also operate in a natural way on any line range.

Over the years, vi has bulked up considerably. Modern versions add mouse support, editing menus, unlimited undo (the original vi could only undo the last command), multiple files in separate buffers, and customization with a run-control file. However, the use of run-control files is still unusual, and in contrast to Emacs, the use of embedded general-purpose scripting has never caught on. Instead, vi implementations have grown individual capabilities to do things, like syntax awareness of C code and output parsing of C compiler error messages, by adding C code to vi itself. Subprocess interaction is not supported.


#### 13.2.3 Sam
The Sam editor5 was written by Rob Pike at Bell Labs in the mid-1980s. Sam was designed for the Plan 9 operating system, which we’ll survey in Chapter 20. While the Sam editor is not widely known outside the Labs, it’s favored by many of the original Unix developers who went on to work on Plan 9, including Ken Thompson himself.

5 <http://plan9.bell-labs.com/sys/doc/sam/sam.html>

Sam is a fairly straightforward descendant of ed, remaining much closer to its parent than vi. Sam incorporates only two new concepts: a curses-style text display and text selection with the mouse.

Each Sam session has exactly one command window, and one or more text windows. Text windows edit text, and command windows accept ed-style editing commands. The mouse is used to move between windows, and to select text regions within text windows. This is a clean, orthogonal, modeless design that discards most of the interface complexity of vi.

Most commands operate by default on a select region that can be painted with a mouse drag operation. The select region for a command can also be set by specifying a line range in the fashion of ed, but Sam gains considerable power from the fact that the user can select at finer granularity than a line range. Because the mouse is available to do selections and rapidly change focus between buffers (including the command buffer), Sam needs no equivalent of the default (command) mode of vi. The hundreds of extended vi commands are unnecessary and, therefore, omitted. Overall, Sam adds only about a dozen commands to the seventeen or so in the ed set, for a total of about thirty.

Four of the new commands in Sam join two inherited from ed(1) and vi(1), as ways to apply regular expressions to the task of selecting files and file regions to operate on. These provide limited but effective loop and conditional facilities to the command language. There is, however, no way to name or parameterize command-language procedures. Nor can the language do interactive control of a subprocess.

An interesting feature of Sam is that it’s split into two parts. separating a back end that manipulates files and does searches from a front end that handles the screen interface. This instance of the “separated engine and interface” chapter has the immediate practical benefit that, though the program has a GUI, it can run easily over a low-bandwidth connection to edit files on a remote server. Also, the front and back ends can be retargeted relatively easily.

Sam, like recent versions of vi, has infinite undo. By design, it supports neither rich-text editing, nor output parsing, nor subprocess interaction.


#### 13.2.4 Emacs
Emacs is undoubtedly the most powerful programmer’s editor in existence. It’s a big, feature-laden program with a great deal of flexibility and customizability. As we observed in the Chapter 14 section on Emacs Lisp, Emacs has an entire programming language inside it that can be used to write arbitrarily powerful editor functions.

Unlike vi, Emacs doesn’t have interface modes; instead, commands are normally control characters or prefixed with an ESC. However, in Emacs it is possible to bind just about any key sequence to any command, and commands can be stock or customized Lisp programs.

Emacs can edit multiple files, each in a separate buffer, and supports moving text among the buffers. Versions running under X have native mouse support.

The Lisp programs bound to Emacs keystrokes can perform arbitrary text transformations on a buffer. This capability is heavily used, among other things to define syntax-aware and rich-text editing modes for dozens of different languages and markup formats (beginning with support and color highlighting of C code as in vi, but going way beyond that). Each mode is simply a library file of Lisp code that is loaded on demand.

Emacs Lisp programs can also interactively control arbitrary subprocesses. Some notable consequences of this capability were listed earlier, including the ability to serve as a front end for version-control systems, debuggers, and the like.

The designers of Emacs6 built a programmable editor that could have task-related intelligence customized into it for hundreds of different specialized editing jobs. They then gave it the ability to drive other tools. As a result, Emacs supports dealing with all things textual in one shared context—files, mail, news, debugger symbols. It can serve as a customizable front end to any command with an interactive textual interface.

6 The designers of Emacs were Richard M. Stallman, Bernie Greenberg, and Richard M. Stallman. The original Emacs was Stallman’s invention, the first version with an embedded Lisp was Greenberg’s, and the now-definitive version is Stallman’s derived from Greenberg’s. No complete account of the design history has been written in 2003, but Greenberg’s Multics Emacs: The History, Design, and Implementation is illuminating and readily discoverable via keyword search on the Web.

It is a common joke, both among fans and detractors of Emacs, to describe it as an operating system masquerading as an editor. That overstates the case, but Emacs certainly does fulfill the role occupied by integrated development environments (IDEs) under non-Unix operating systems (a theme to which we shall return in Chapter 15).

This power comes at a price in complexity. To use a customized Emacs you have to carry around the Lisp files that define your personal Emacs preferences. Learning how to customize Emacs is an entire art in itself. Emacs is correspondingly harder to learn than vi.


#### 13.2.5 Wily
The wily editor7 is a clone of the Plan 9 editor acme.8 It shares some facilities with Sam, but is intended to provide a fundamentally different user experience. Although Wily probably sees the least widespread use of any of these editors, it is interesting because it illustrates a different and arguably more Unixy way of implementing an Emacs-like programmable editor.

7 <http://www.cs.yorku.ca/~oz/wily>

8 <http://plan9.bell-labs.com/sys/doc/acme/acme.html>

Wily could be described as a minimalist IDE, an implementation of Emacs-style extensibility without the decades of accompanying cruft. In Wily, even global search and replace, that sine qua non of Unix editors, is supplied by an external program. The built-in commands relate almost exclusively to windowing operations. Wily is designed from the ground up to use the mouse as much, and as well, as possible.

Wily attempts to replace not only conventional editors but conventional terminal windows such as xterm(1) as well. In Wily, any piece of text within the main window (which contains multiple non-overlapping Wily windows) can be an action or a search expression. The left mouse button is used to select text, the middle button to execute text as a command (either built-in or external), and the right button to search either Wily’s buffers or the file system for text. No permanent or popup menus are required.

In Wily, the keyboard is used only to enter text. Shortcuts are achieved not by special use of the keyboard, but by holding down more than one mouse button at the same time. These shortcuts are always equivalent to using the middle button on some built-in command.

Wily can also be used as the front end for C, Python, or Perl programs, reporting to them whenever a window is changed or an execute or search command is performed with the mouse. These plugins function analogously to Emacs modes, but don’t run in the same address space with Wily; instead, they communicate with it via a very simple set of remote procedure calls. Wily comes packaged with an xterm analog and a mail tool which uses it as the editing front end.

Because Wily depends on the mouse so heavily, it cannot be used on a character-cell-only console display; nor can it be used over a remote link without X forwarding. As an editor, Wily is designed for editing plain text; it has only two fonts (one proportional and one fixed-width) and has no mechanism that could support rich-text editing or syntax awareness.


### 13.3 The Right Size for an Editor
Now let us examine our case studies using the complexity categories we developed at the beginning of this chapter.


#### 13.3.1 Identifying the Complexity Problems
Every text editor has a certain amount of essential complexity. At minimum, it has to maintain an internal buffer copy of the file or files the user is editing. Functions to import and export file data are a minimum requirement (usually from and to disk, though the stream editor sed(1) is an interesting exception). Some way to modify the buffer must be supported, though we cannot specify what way without describing specific features that are optional. Our four examples show widely varying levels of optional and accidental complexity beyond this.

Of all of these, ed(1) has the least complexity. Almost the only non-orthogonal feature in its command set is the fact that many of its commands can take a ’p’ or ’l’ suffix to print or list command results. Even after three decades of feature additions there are fewer than thirty editing commands, and the normal working set for most users will be less than a dozen. There is not much in the way of optional complexity that could be removed here, and it’s hard to identify any accidental complexity at all. The user interface of ed is strictly compact.

On the flip side, the ed interface is not really suitable for editing tasks even as basic as rapidly flipping through a text file. One has to limit one’s objectives pretty sharply for ed to become an acceptable solution for interactive editing.

Suppose, then, that we add “support visual browsing and editing of multiple files” as an objective? Then Sam seems not very far from being the minimal ed extension that could achieve this. The fact that the designers did not change the semantics of the inherited ed commands is notable; they kept an existing, orthogonal set and added a relatively small set of capabilities that are themselves orthogonal.

One large increase in optional (implementation) complexity is Sam’s infinite-undo capability. Another significant one is the new regular-expression-based loop and iteration facility in the command language. These, and the fact that the mouse can be used as a selection device, are about all that distinguish Sam from a hypothetical ed with a mouse-and-windows interface.

Without a thorough code audit it’s difficult to be sure, but at the design level it’s hard to identify any accidental complexity in Sam. The interface is at least semi-compact and arguably strictly compact. This editor lives up to the very highest standards of Unix design—unsurprisingly, given its provenance.

By contrast, vi looks rather bloated and flabby. There are hundreds of commands, many of them duplicative. These are at best optional complexity, and perhaps accidental. At a guess, most users don’t know more than 5% of the command set. With the example of Sam before us, it’s fair to wonder why the interface complexity of vi is so high.

In Chapter 11 we described the effect of the absence of standard arrow keys on early roguelike programs; vi was one of these. When vi was built, its author knew that many of his users would need to be able to use the cursor motion keys traditional on Unix glass teletypes. This made a modal interface inevitable. Once the hjkl keys had mode-dependent meanings in an edit buffer, it was all too easy to fall into the habit of adding new commands in an ad-hoc way.

Sam, designed as it is to depend on a bitmapped display with both arrow keys and a mouse, can be much cleaner. And it is.

But the clutter of vi commands is a relatively superficial problem. It’s interface complexity, yes, but of a kind most users can and do ignore (the interface is semi-compact in the sense we developed in Chapter 4). The deeper problem is an adhocity trap. Over the years, vi has had progressively more and more special-purpose C code bolted onto it to perform tasks that Sam refuses to do and that Emacs would attack with Lisp code modules and subprocess control. The extensions are not, as in Emacs, libraries loaded as needed; users pay the overhead for the resulting code bloat all the time. As a result, the size difference between a modern vi and a modern Emacs is not nearly as great as one might expect; in mid-2003 on an Intel-architecture machine, it’s 1500KB for GNU Emacs versus 900KB for vim. There is a whole lot of both optional and accidental complexity in that 900KB.

For vi partisans, not having an embedded scripting language—not being Emacs—has become an identity issue, a central part of the shared myth that vi is a lightweight editor. While vi fans like to talk about filtering buffers with external programs and scripts to do what Emacs’s embedded scripting does, the reality is that vi’s “!” command cannot filter regions of an edit buffer selected at finer granularity than a range of lines (Sam and Wily, though they have no more subprocess management than vi does, can at least filter arbitrary text ranges, not just line ranges). All knowledge of file formats and syntaxes that vary at a finer granularity (and most do) has to be built in to C code if vi is going to have it available at all. There is thus little prospect that the codebase-size ratio between Emacs and vi will improve in favor of vi; indeed, it seems likely to get worse.

Emacs is sufficiently large, and has a sufficiently tangled history, to make separating its optional from its accidental complexity quite a challenge. We can at least begin by trying to separate the dispensable accidents of the Emacs design from its indispensable essentials.

Perhaps the most conspicuously dispensable part of the Emacs design is Emacs Lisp. It is essential to what Emacs does that it features what we nowadays call an embedded scripting language, but Emacs would be little different in capability if that language had been Python or Java or Perl. At the time Emacs was designed in the 1970s, however, Lisp was about the only language that had the characteristics (including unlimited-extent types and garbage collection) to fit it to the job.

Much in the particulars of the way emacs handles event processing and drives a bitmapped display (including the support for internationalization) is accidental as well. The one great schism in its history (the GNU Emacs/XEmacs fork) was over these issues, and demonstrates that nothing in the rest of the design prefers or requires any one event model.

On the other hand, the ability to bind arbitrary event sequences to arbitrary built-in or user-defined functions is indispensable. The scripting language could change and the event model could change, but without the anything-goes polymorphism in the way they are connected, the Emacs design would be both unrecognizable and crippled. Extension modes would have to fight each other for ownership of a limited event set, and activating multiple cooperating modes on the same buffer would be difficult or impossible.

The huge library of extension modes shipped with Emacs is accidental as well. The ability to construct such extensions may be essential, but the particular set we have is a product of history and chance. They could all be different or replaced; the result would still, recognizably, be Emacs.

But subprocess interaction is indispensable. Without it, Emacs modes could not perform the expected IDE-like integration and front-ending of many different tools.

Experience with small editors that clone the default keybindings and appearance of Emacs without emulating its extensibility is instructive. There have been several such clones, of which the best known are probably MicroEmacs and pico, but none have ever acquired significant mindshare.

Having identified accident and essence in the Emacs design helps us get a handle on which of its complexity is optional and which accidental. But, more importantly, they help us see past the superficial differences between Emacs and the previous three editors we have considered, to the really critical difference: the fact that the objectives of the Emacs design are far more broad. Emacs wants to be a unified interface to all tools that operate on text.

Wily makes an interesting contrast with Emacs. As with Sam, the amount of optional complexity is low; the Wily user interface can be succinctly but effectively described in a single page.

But this elegance comes with a price; it is not possible to bind functions to any keystrokes or input gestures other than a restricted set of mouse chords. Instead, every editor function other than very basic text insertion and deletion has to be implemented with a program outboard of the editor, either a standalone script or a specialized symbiont process listening to Wily input events. (The former technique relies on outboard program startups being fast enough not to produce noticeable interface lag, something which was emphatically not the case in either Emacs’s natal environment or under the Unixes it was first ported to.)

Optional complexity which Emacs would implement in Lisp extension modes is instead distributed through specialized symbionts; each has to know the special Wily messaging interface. An advantage of this approach is that such symbionts can be written in any language the user chooses. In addition, the symbionts (because they run outboard) cannot adversely affect each other or the Wily core (which is not true of Emacs modes). A disadvantage is that Wily itself cannot directly do subprocess interaction with ordinary Unix tools at all.

In this and other ways, wily’s distributed scripting is not as powerful as the embedded scripting of Emacs. The scope of Wily’s objectives is correspondingly narrower; the authors disclaim any interest in syntax-aware editing, or rich text, for example, and neither Wily nor its Plan 9 ancestor acme can do these things.

This brings us to another, and sharper way of posing the central question of this chapter: When do large objectives justify a large program?


#### 13.3.2 Compromise Doesn’t Work
The comparison between Sam and vi suggests strongly that, at least where editors are concerned, attempts to compromise between the minimalism of ed and the all-singing-all-dancing comprehensiveness of Emacs don’t work very well; vi attempts this, and ends up with neither virtue. Instead, it falls into an adhocity trap. Wily avoids the adhocity trap, but cannot match the power of Emacs and must demand a custom process interface from each of its interactive symbionts in order to come anywhere close.

Evidently something about editors tends to push them in the direction of increasing complexity. In the case of vi, that something is not hard to identify; it’s the desire for convenience. While ed may be theoretically adequate, very few people (other than perhaps Ken Thompson himself) would forgo screen-oriented editing to make a statement about software bloat.

More generally, programs that mediate between the user and the rest of the universe notoriously attract features. This includes not just editors but Web browsers, mail and newsgroup readers, and other communications programs. All tend to evolve in accordance with the Law of Software Envelopment, aka Zawinski’s Law: “Every program attempts to expand until it can read mail. Those programs which cannot so expand are replaced by ones which can”.

Jamie Zawinski, inventor of the Law (and one of the principal authors of the Netscape and Mozilla Web browsers), maintains more generally that all really useful programs tend to turn into Swiss Army knives. The commercial success of large, integrated application suites outside the Unix world tends to confirm this, and directly challenges the Unix philosophy of minimalism.

To the extent Zawinski’s Law is correct, it suggests that some things want to be small and some want to be large, but the middle ground is unstable. The superficial problems with vi can be put down to history, but the deeper ones trace back to the combination of steady pressure to add features with refusal to embed the scripting and subprocess-control features that vi partisans associate with excessive size. On a different level, accepting that there would be two modes in the interface (insertion versus character-motion) opened a can of worms—it became far too easy to add new commands without thinking about their complexity impact on the overall design.

The examples of Emacs and Wily further suggest why some things want to be large: so that several related tasks can share context. Editing and version control (or editing and mail, editing and symbolic debugging, etc.) are separate tasks from the point of view of the implementers—but users would often prefer to have one big environment that lets them point at pieces of text, rather than spend time and attention ping-ponging between several programs that each have to have the same filename or the contents of some cut buffer handed to them.

More generally, let’s suppose we view the entire Unix environment as a single work of design by community. Then the religion of “small, sharp tools”, the pressure to keep interface complexity and codebase size down, may lead right to a manularity trap—the user has to maintain all the shared context himself, because the tools won’t do it for him.

Returning to the specific context of editors, Sam shows us that vi is the wrong thing. Wily is a valiant effort to avoid the vastness of Emacs that falls short because it can’t be syntax-aware. But Wily, or some realization of the Emacs design ideas cleaned up and stripped of historical baggage, might be the right thing. The value of optional complexity depends on the objectives you choose, and the ability to share context among all the text-oriented tools related to a task is valuable.


#### 13.3.3 Is Emacs an Argument against the Unix Tradition?
The traditional Unix view of the world, however, is so attached to minimalism that it isn’t very good at distinguishing between the adhocity-trap problems of vi and the optional complexity of Emacs.

The reason that vi and emacs never caught on among old-school Unix programmers is that they are ugly. This complaint may be “old Unix” speaking, but had it not been for the singular taste of old Unix, “new Unix” would not exist.

—Doug McIlroy

Attacks on Emacs by vi users—along with attacks on vi by the hard-core old-school types still attached to ed—are episodes in a larger argument, a contest between the exuberance of wealth and the virtues of austerity. This argument correlates with the tension between the old-school and new-school styles of Unix.

The “singular taste of old Unix” was partly a consequence of poverty in exactly the same way that Japanese minimalism was—one learns to do more with less most effectively when having more is not an option. But Emacs (and new-school Unix, reinvented on powerful PCs and fast networks) is a child of wealth.

As, in a different way, was old-school Unix. Bell Labs had enough resources so that Ken was not confined by demands to have a product yesterday. Recall Pascal’s apology for writing a long letter because he didn’t have enough time to write a short one.

—Doug McIlroy

Ever since, Unix programmers have maintained a tradition that exalts the elegant over the excessive.

The vastness of Emacs, on the other hand, did not originate under Unix, but was invented by Richard M. Stallman within a very different culture that flourished at the MIT Artificial Intelligence Lab in the 1970s. The MIT AI lab was one of the wealthiest corners of computer-science academia; people learned to treat computing resources as cheap, anticipating an attitude that would not be viable elsewhere until fifteen years later. Stallman was unconcerned with minimalism; he sought the maximum power and scope for his code.

The central tension in the Unix tradition has always been between doing more with less and doing more with more. It recurs in a lot of different contexts, often as a struggle between designs that have the quality of clean minimalism and others that choose expressive range and power even at the cost of high complexity. For both sides, the arguments for or against Emacs have exemplified this tension since it was first ported to Unix in the early 1980s.

Programs that are both as useful and as large as Emacs make Unix programmers uncomfortable precisely because they force us to face the tension. They suggest that old-school Unix minimalism is valuable as a discipline, but that we may have fallen into the error of dogmatism.

There are two ways Unix programmers can address this problem. One is to deny that large is actually large. The other is to develop a way of thinking about complexity that is not a dogma.

Our thought experiment with replacing Lisp and the extension libraries gives us a new perspective on the oft-heard charge that Emacs is bloated because its extension library is so large. Perhaps this is as unfair as charging that /bin/sh is bloated because the collection of all shellscripts on a system is large. Emacs could be considered a virtual machine or framework around a collection of small, sharp tools (the modes) that happen to be written in Lisp.

On this view, the main difference between the shell and Emacs is that Unix distributors don’t ship all the world’s shellscripts along with the shell. Objecting to Emacs because having a general-purpose language in it feels like bloat is approximately as silly as refusing to use shellscripts because shell has conditionals and for loops. Just as one doesn’t have to learn shell to use shellscripts, one doesn’t have to learn Lisp to use Emacs. If Emacs has a design problem, it’s not so much the Lisp interpreter (the framework part) as the fact that the mode library is an untidy heap of historical accretions—but that’s a source of complexity users can ignore, because they won’t be affected by what they don’t use.

This mode of argument is very comforting. It can be applied to other tool-integration frameworks, such as the (uncomfortably large) GNOME and KDE desktop projects. There is some force to it. And yet, we should be suspicious of any ’perspective’ that offers to resolve all our doubts so neatly; it might be a rationalization, not a rationale.

Therefore, let’s avoid the possibility of falling into denial and accept that Emacs is both useful and large—that it is an argument against Unix minimalism. What does our analysis of the kinds of complexity in it, and the motives for it, suggest beyond that? And is there reason to believe that those lessons generalize?


### 13.4 The Right Size of Software
There is a hidden dual of the Unix gospel of small, sharp tools; a background so implicit that many Unix practitioners do not notice it, any more than fish notice the water they swim in. It is the presence of frameworks.

Small, sharp tools in the Unix style have trouble sharing data, unless they live inside a framework that makes communication among them easy. Emacs is such a framework, and unified management of shared context is what the optional complexity of Emacs is buying. The practical impact of unified management of shared context is that the user is not burdened with low-level naming and resource-management issues.

In old-school Unix, the only framework was pipelines, redirection, and the shell; the integration was done with scripts, and the shared context was (essentially) the file system itself. But that was not the end of evolution.

Emacs unifies the file system with a world of text buffers and helper processes, largely leaving the shell framework behind. Wily is also about buffers and helpers, but incorporates the shell framework into itself. Modern desktop environments provide a communication framework for GUIs, also leaving the shell framework behind. Each framework has strengths and weaknesses of its own. Frameworks become homes to ecologies of tools—the shell to shellscripts, Emacs to Lisp modes, and desktop environments to flocks of GUIs communicating both via drag and drop and by more esoteric means such as object brokers.

This suggests a Rule of Minimality: Choose the shared context you want to manage, and build your programs as small as those boundaries will allow. This is “as simple as possible, but no simpler”, but it focuses attention on the choice of shared context. It applies not just to frameworks, but to applications and program systems.

It is, however, all too easy to get sloppy about how large your shared context needs to be. The pressure behind Zawinski’s Law is the tendency of applications to want to share context for convenience. It’s easy to end up carrying around too much weight, too many assumptions, and to write programs that are over-complex, bloated, and huge. The paradigmatic example in the 1990s was the way that the mailto: URL induced the growth of huge mail clients embedded in Web browsers.

The corrective to this tendency comes straight from the old-school Unix hymnbook. It is the Rule of Parsimony: Write a big program only when it is clear by demonstration that nothing else will do—that is, when attempts to partition the problem have been made and failed. This maxim implies an astringent skepticism about large programs, and a strategy for avoiding them: look for the small-program solution first. If a single small program won’t do the job, try building a toolkit of cooperating small programs within an existing framework to attack it. Only if both approaches fail are you free (in the Unix tradition) to build a large program (or a new framework) without feeling you have failed the design challenge.

When you do write a framework, remember the Rule of Separation. Frameworks should be mechanism, and have as little policy as possible. In most cases, that is no policy at all. Factor as much behavior as possible into modules that use the framework. One of the benefits of writing or reusing a framework is that it can help you separate what would otherwise be big lumps of policy into separate modules, modes, or tools—pieces that can be usefully recombined with others.

These rules are valuable heuristics, but the tension at the heart of the Unix tradition does not resolve neatly into a set of a-priori prescriptions for optimal size of any given project. Circumstances alter cases, and exercising good judgment and good taste is what software designers are for. As in Soto Zen, the journey is the destination; enlightenment has to be rediscovered in every day of practice.