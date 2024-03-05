# Part III. Implementation

[[toc]]

## 14. Languages: To C or Not To C?

The limits of my language are the limits of my world.

Tractatus Logico-Philosophicus 5.6, 1918
—Ludwig Wittgenstein


### 14.1 Unix’s Cornucopia of Languages
Unix supports a wider variety of application languages than does any other single operating system; indeed, it may well have hosted more different languages than every other operating system in the history of computing combined.1

1 See the Free Compiler and Interpreter List <ftp://ftp.idiom.com/pub/compilers-list/free-compilers> for details.

There are at least two excellent reasons for this huge diversity. One is the wide use of Unix as a research and teaching platform. The other (far more relevant for working programmers) is the fact that matching your application design with the proper implementation language(s) can make an immense difference in your productivity. Therefore the Unix tradition encourages the design of domain-specific languages (as we mentioned in Chapter 7 and Chapter 9) and what are now generally called scripting languages—those designed specifically to glue together other applications and tools.

The term “scripting language” probably derives from the term “script” that was applied to a potted input for a normally interactive program, in particular sh or ed—a much more felicitous term than the “runcom” we inherited from Unix’s ancestor CTSS. “Script” appears in the V7 manual (1979). I don’t recall who coined the name.

—Doug McIlroy

In truth, the term ’scripting language’ is a somewhat awkward one. Many of the the major languages usually so described (Perl, Tcl, Python, etc.) have outgrown the group’s scripting origins and are now standalone general-purpose programming languages of considerable power. The term tends to obscure strong similarities in style with other languages that are not usually lumped in with this group, notably Lisp and Java. The only argument for continuing to use it is that nobody has yet invented a better term.

Part of the reason all these can be lumped together under the rubric of ’scripting language’ is that they all have pretty much the same ontogeny. Having a runtime to do interpretation also makes it relatively easy to automate dynamic storage management. Automating dynamic storage management almost requires using references (opaque memory addresses that you can’t do arithmetic on) rather than passing value copies or explicit pointers around. Using references makes runtime polymorphism and OO an easy next step. Voila: the modern scripting language!

To apply the Unix philosophy effectively, you’ll need to have more than just C in your toolkit. You’ll need to learn how to use some of Unix’s other languages (especially the scripting languages), and how to be comfortable mixing multiple languages in specialist roles within large program systems.

In this chapter we’ll survey C and its most important alternatives, discussing their strengths and weaknesses and the sorts of tasks to which they are best matched. The languages covered will be C, C++, shell, Perl, Tcl, Python, Java, and Emacs Lisp. Each survey section will include case studies on applications written using these languages, and references to other examples and tutorial material. High-quality implementations of all these languages are available in open source on the Internet.

Warning: Choice of application language is one of the archetypal religious issues in the Internet/Unix world. People get very attached to these tools and will sometimes defend them past all reason. If this chapter achieves its aim, zealots of all stripes may be offended by this chapter, but everyone else will learn from it.


### 14.2 Why Not C?
C is the native language of Unix. Since the early 1980s it has come to dominate systems programming almost everywhere in the computer industry. Outside of Fortran’s dwindling niche in scientific and engineering computing, and excluding the vast invisible dark mass of COBOL financial applications at banks and insurance companies, C and its offspring C++ have now (in 2003) dominated applications programming almost completely for more than a decade.

It may therefore seem perverse to assert that C and C++ are nowadays almost always the wrong vehicle for beginning new applications development. But it’s true; C and C++ optimize for machine efficiency at the expense of increased implementation and (especially) debugging time. While it still makes sense to write system programs and time-critical kernels of applications in C or C++, the world has changed a great deal since these languages came to prominence in the 1980s. In 2003, processors are a thousand times faster, memories are a thousand times larger, and disks are a factor of ten thousand larger, for roughly constant dollars.2

2 Outside the Unix world, this three-orders-of-magnitude improvement in hardware performance has been masked to a significant extent by a corresponding drop in software performance.

These plunging costs change the economics of programming in a fundamental way. Under most circumstances it no longer makes sense to try to be as sparing of machine resources as C permits. Instead, the economically optimal choice is to minimize debugging time and maximize the long-term maintainability of the code by human beings. Most sorts of implementation (including application prototyping) are therefore better served by the newer generation of interpreted and scripting languages. This transition exactly parallels the conditions that, last time around the wheel, led to the rise of C/C++ and the eclipse of assembler programming.

The central problem of C and C++ is that they require programmers to do their own memory management—to declare variables, to explicitly manage pointer-chained lists, to dimension buffers, to detect or prevent buffer overruns, and to allocate and deallocate dynamic storage. Some of this task can be automated away by unnatural acts like retrofitting C with a garbage collector such as the Boehm-Weiser implementation, but the design of C is such that this cannot be a complete solution.

C memory management is an enormous source of complication and error. One study (cited in [Boehm]) estimates that 30% or 40% of development time is devoted to storage management for programs that manipulate complex data structures. This did not even include the impact on debugging cost. While hard figures are lacking, many experienced programmers believe that memory-management bugs are the single largest source of persistent errors in real-world code.3 Buffer overruns are a common cause of crashes and security holes. Dynamic-memory management is particularly notorious for spawning insidious and hard-to-track bugs, such as memory leaks and stale-pointer problems.

3 The severity of this problem is attested to by the rich slang Unix programmers have developed for describing different varieties: ’aliasing bug’, ’arena corruption’, ’memory leak’, ’buffer overflow’, ’stack smash’, ’fandango on core’, ’stale pointer’, ’heap trashing’, and the rightly dreaded ’secondary damage’. See the Jargon File <http://www.catb.org/~esr/jargon> for elucidation.

Not so long ago, manual memory management made sense anyway. But there are no ’small systems’ any more, not in mainstream applications programming. Under today’s conditions, an implementation language that automates away memory management (and buys an order of magnitude decrease in bugs at the expense of using a bit more cycles and core) makes a lot more sense.

A recent paper [Prechelt] musters an impressive array of statistical evidence for a claim that programmers with experience in both worlds will find very plausible: programmers are just about twice as productive in scripting languages as they are in C or C++. This accords well with the 30%–40% penalty estimate noted earlier, plus debugging overhead. The performance penalty of using a scripting language is very often insignificant for real-world programs, because real-world programs tend to be limited by waits for I/O events, network latency, and cache-line fills rather than by the efficiency with which they use the CPU itself.

The Unix world has been slowly coming around to this point of view in practice, especially since 1990 or so, as is shown by the increasing popularity of Perl and other scripting languages. But the evolution of practice has not yet (as of mid-2003) led to a wholesale change in conscious attitudes; many Unix programmers are still absorbing the lesson Perl and Python have been teaching.

We can see the same trend happening, albeit more slowly, outside the Unix world—for example, in the continuing shift from C++ to Visual Basic evident in applications development under Microsoft Windows and NT, and the move toward Java in the mainframe world.

The arguments against C and C++ apply with equal force to other conventional compiled languages such as Pascal, Algol, PL/I, FORTRAN, and compiled Basic dialects. Despite occasional heroic efforts such as Ada, the differences between conventional languages remain superficial when set against their basic design decision to leave memory management to the programmer. Though high-quality open-source implementations of most languages ever written are available under Unix, no other conventional languages remain in widespread use in the Unix or Windows worlds; they have been abandoned in favor of C and C++. Accordingly we will not survey them here.


### 14.3 Interpreted Languages and Mixed Strategies
Languages that avoid manual memory management do it by having a memory manager built into their runtime executable somewhere. Typically, runtime environments in these languages are split into a program part (the running script itself) and the interpreter part, with the interpreter managing dynamic storage. On Unixes (and other modern operating systems) the interpreter core can be shared by multiple program parts, reducing the effective overhead for each one.

Scripting is nowhere near a new idea in the Unix world. As far back as the mid-1970s, in an era of far smaller machines, the Unix shell (the interpreter for commands typed to a Unix console) was designed as a full interpreted programming language. It was common even then to write programs entirely in shell, or to use the shell to write glue logic that knit together canned utilities and custom programs in C into wholes greater than the sum of their parts. Classical introductions to the Unix environment (such as The Unix Programming Environment [Kernighan-Pike84]) have dwelt heavily on this tactic, and with good reason: it was one of Unix’s most important innovations.

Advanced shell programming mixes languages freely, employing both binaries and interpreted elements from half a dozen or more other languages for subtasks. Each language does what it does best, each component is a module with narrow interfaces to the others, and the global complexity of the whole is much lower than it would be had it been coded as a single monster monolith in a general-purpose language.


### 14.4 Language Evaluations
Mixing languages is a knowledge-intensive (rather than coding-intensive) style of programming. To make it work, you have to have both working knowledge of a suitable variety of languages and expertise about what they’re best at and how to fit them together. In this section, we will try to point you at references to help you with the first and an overview to convey the second. For each language surveyed we will include case studies of successful programs that exemplify its strengths.


#### 14.4.1 C
Despite the memory-management problem, there are some application niches for which C is still king. Programs that require maximum speed, have real-time requirements, or are tightly coupled to the OS kernel are good candidates for C.

Programs that must be portable across multiple operating systems may also be good candidates for C. Some of the alternatives to C that we shall discuss below are, however, increasingly penetrating major non-Unix operating systems; in the near future, portability may be less a distinguishing advantage of C.

Sometimes the leverage to be gained from existing programs like parser generators or GUI builders that generate C code is so great that it justifies C coding of the rest of a small application.

And, of course, C proved indispensable to the developers of all its alternatives. Dig down through enough implementation layers under any of the other languages surveyed here and you will find a core implemented in pure, portable C. These languages inherit many of the advantages of C.

Under modern conditions, it’s perhaps best to think of C as a high-level assembler for the Unix virtual machine (recall the discussion of the success of C as a case study in Chapter 4). C standards have exported many of the facilities of this virtual machine, such as the standard I/O library, to other operating systems. C is where you go when you want to get as close as possible to the bare metal but stay portable.

One good reason to learn C, even if your programming needs are satisfied by a higher-level language, is that it can help you learn to think at hardware-architecture level. The best reference and tutorial on C for people who are already programmers is still The C Programming Language [Kernighan-Ritchie].

Porting C code between Unix variants is almost always possible and usually easy, but specific areas of variation (like signals and process control) can be tricky to get right. We highlight some of these issues in Chapter 17. Differing C bindings on other operating systems can of course cause C portability problems, although Windows NT at least theoretically supports an ANSI/POSIX-compliant C API.

High-quality C compilers are available as open-source software over the Internet; the best-known and most widely used is the Free Software Foundation’s GNU C compiler (part of GCC, the GNU Compiler Collection), which has become the native C of all open-source Unix systems and many even in the closed-source world. GCC ports are even available for Microsoft’s family of operating systems. GCC sources are available at the FSF’s FTP site <ftp://ftp.gnu.org/pub/gnu>.

Summing up: C’s best side is resource efficiency and closeness to the machine. Its worst side is that programming in it is a resource-management hell.


#### 14.4.1.1 C Case Study: fetchmail
The best case study for C is the Unix kernel itself, for which a language that naturally supports hardware-level operations is actually a strong advantage. But fetchmail is a good example of the kind of user-land utility that is still best coded in C.

fetchmail does only the simplest kind of dynamic-memory management; its only complex data structure is a singly-linked list of per-mailserver control blocks built just once, at startup time, and changed only in fairly trivial ways afterwards. This substantially erodes the case against using C by sidestepping C’s greatest weakness.

On the other hand, these control blocks are fairly complex (including all of string, flag, and numeric data) and would be difficult to handle as coherent fast-access objects in an implementation language without an equivalent of the C struct feature. Most of the alternatives to C are weaker than C in this respect (Python and Java being notable exceptions).

Finally, fetchmail requires the ability to parse a fairly complex specification syntax for per-mail-server control information. In the Unix world this sort of thing is classically handled by using C code generators that grind out source code for a tokenizer and grammar parser from declarative specifications. The existence of yacc and lex was a point in favor of C.

fetchmail might reasonably have been coded in Python, albeit with possibly significant loss of performance. Its size and data-structure complexity would have excluded shell and Tcl right off and strongly counterindicated Perl, and the application domain is outside the natural scope of Emacs Lisp. A Java implementation wouldn’t have been an unreasonable path, but Java’s object-oriented style and garbage collection would have offered little purchase on fetchmail’s specific problems over what C already yields. Nor could C++ have done much to simplify the relatively simple internal logic of fetchmail.

However, the real reason fetchmail is a C program is that it evolved by gradual mutation from an ancestor already written in C. The existing implementation has been extensively tested on many different platforms and against many odd and quirky servers. Carrying all that implicit knowledge through to a re-implementation in a different language would be messy and difficult. Furthermore, fetchmail depends on imported code for functions (like NTLM authentication) that don’t seem to be available above C level.

fetchmail’s interactive configurator, which did not have a C legacy problem, is written in Python; we’ll discuss that case along with that language.


#### 14.4.2 C++
When C++ was first released to the world in the mid-1980s object-oriented (OO) languages were being widely touted as the silver bullet for the software-complexity problem. C++’s OO features appeared to be an overwhelming advantage over the ancestral C, and partisans expected that it would rapidly make the older language obsolete.

This has not happened. Part of the fault can be laid to problems in C++ itself; the requirement that it be backward-compatible with C forced a great many compromises on the design. Among other things, that requirement prevented C++ from going to fully automatic dynamic-memory management and addressing C’s most serious problem. Later, feature arms races between different compiler implementers, unconstrained by a weak and premature standardization effort, pushed C++ to become rather baroque and excessively complicated.

Another part of the fault must be laid to the failure of OO itself to live up to expectations. We examined this problem in Chapter 4, observing the tendency of OO methods to lead to thick glue layers and maintenance problems. Today (2003), inspection of open-source archives (in which choice of language reflects developers’ judgments rather than corporate mandates) reveals that C++ usage is still heavily concentrated in GUIs, multimedia toolkits and games (the major success areas for OO design), and little used elsewhere.

It may be that C++’s realization of OO is particularly problem-prone. There is some evidence that C++ programs have higher life-cycle costs than equivalents in C, FORTRAN, or Ada. Whether this is a problem with OO or specifically with C++ or both remains unclear, though there is reason to suspect both are implicated [Hatton98].

In recent years, C++ has incorporated some important non-OO ideas. It has exceptions similar to those in Lisp; that is, it is possible to throw an object or value up the call stack until it is caught by a handler. STL (Standard Template Library) provides generic programming; that is, it is possible to code algorithms that are independent of the type signature of their data and have them compiled to do the right thing at runtime. (Only languages that do compile-time static type-checking need this; more dynamic languages simply pass around typeless references and support type identification at runtime.)

Efficient compiled language; upward-compatible with C; object-oriented platform; vehicle for cutting-edge techniques like STL and generics—C++ tries to be all things to all people, but the cost is more complexity than the mind of any individual programmer can handle. As we noted in Chapter 4, the language’s principal designer has conceded that he doesn’t expect any one programmer to grasp it all. Unix hackers do not react well to this; one anonymous but famous characterization is “C++: an octopus made by nailing extra legs onto a dog”.

When all is said and done, however, C++’s most fundamental problem is that it is basically just another conventional language. It confines the memory-management problem better than it did before the invention of the Standard Template Library, and a lot better than C does, but the confinement is brittle; it breaks unless your code uses objects and only objects. For many types of application its OO features are not significant, and simply add complexity to C without yielding much advantage. Open-source C++ compilers are available; if C++ were unequivocally superior to C it would now dominate.

Summing up: C++’s best side is its combination of compiled efficiency with facilities for OO and generic programming. Its worst side is that it is baroque and complex, and tends to encourage over-complex designs.

Consider using C++ if an existing C++ toolkit or service library offers powerful leverage for your application, or if you’re in one of the application areas mentioned above for which an OO language is known to be a large win.

The classic C++ reference is Stroustrup’s The C++ Programming Language [Stroustrup]. You will find an excellent beginner’s tutorial on C++ and basic OO methods in C++: A Dialog [Heller]. C++ Annotations [Brokken] is a condensed introduction to C++ for expert C programmers.

The Gnu Compiler Collection includes a C++ compiler. The language is therefore universally available on Unix and on Microsoft operating systems; comments made under C above also apply here. Strong collections of open-source support libraries <http://www.boost.org/> are available. However, portability is compromised by the fact that (as of mid-2003) actual C++ implementations implement widely varying subsets of the draft ISO standard now in preparation.4

4 The last C++ standard, dating from 1998, was widely implemented but weak, especially in the area of libraries.


#### 14.4.2.1 C++ Case Study: The Qt Toolkit
The Qt interface toolkit is one of the notable C++ success stories in today’s open-source world. It provides a widget set and API for writing graphical user interfaces under X, one deliberately (and rather effectively) designed to emulate the visual look and feel of Motif, MacOS Platinum, or the Microsoft Windows interface. Qt actually provides more than just GUI services; it also provides a portable application layer, with classes for XML, file access, sockets, threads, timers, time/date handling, database access, various abstract data types, and Unicode.

The Qt toolkit is a critical and visible component of the KDE project, the senior of the open-source world’s two efforts to produce a competitive GUI and integrated set of desktop productivity tools.

Qt’s C++ implementation exhibits the strengths of an OO language for encapsulating user-interface components. In a language supporting objects, a visual hierarchy of interface widgets can be cleanly expressed in the code by a hierarchy of class instances. While this sort of thing can be simulated in C with explicit indirection through hand-rolled method tables, such code is much cleaner in C++. Comparison with the notoriously baroque C API of Motif is instructive.

The Qt source code and reference documentation are available at the Trolltech site <http://www.trolltech.com/>.


#### 14.4.3 Shell
The ’Bourne shell’ (sh) of Version 7 Unix was Unix’s first (and for many years its only) portable interpreted language. Today the ancestral Bourne shell has largely been displaced by variants of the upward-compatible Korn Shell (ksh); the single most important of these is the Bourne Again Shell, bash.

A few other shells exist and are used interactively, but are not significant as programming languages; of these, the best known is probably the C shell csh, which is notoriously5 unsuitable for writing scripts.

5 See Tom Christiansen’s essay Csh Programming Considered Harmful, which should be readily findable via Web search.

Simple shell programs are extremely easy and natural to write. The Unix tradition of rapid prototyping in interpretive languages began with shell.

I wrote the very first version of netnews as a 150-line shellscript. It had multiple newsgroups and cross-posting; newsgroups were directories and cross-posting was implemented as multiple links to the article. It was far too slow to use for production, but the flexibility permitted endless experimentation with the protocol design.

—Steven M. Bellovin

As program size gets larger, however, they tend to become rather ad hoc. Some parts of shell syntax (notably its quoting and statement-syntax rules) can be very confusing. These drawbacks generally relate to compromises in the programming-language part of the shell’s design made to preserve its utility as an interactive command-line interpreter.

Programs are described as being ’in shell’ even when they are not pure shell but include heavy use of C filters like sort(1) and of standard text-processing minilanguages like sed(1) or awk(1). This sort of programming has been in decline for some years, however; nowadays such elaborate glue logic is generally written in Perl or Python, with shell being reserved for the simplest kinds of wrappers (for which these languages would be overkill) and system boot-time initialization scripts (which cannot assume they are available).

Such basic shell programming should be adequately covered in any introductory Unix book. The Unix Programming Environment [Kernighan-Pike84] remains one of the best sources on intermediate and advanced shell programming. Korn shell implementations or clones are present on every Unix.

Complex shellscripts often have portability problems, not so much because of the shell itself but because they make assumptions about what other programs are available as components. While Bourne and Korn-shell clones have been sporadically available on non-Unix operating systems, shell programs are not (practically speaking) at all portable off Unix.

Summing up: shell’s best side is that it is very natural and quick for small scripts. Its worst side is that large shellscripts depend on lots of auxiliary commands that aren’t necessarily identically behaved nor even present on all target machines. Nor is it easy to analyze the dependencies in a large shellscript.

It is almost never necessary to build or install a shell, since all Unix systems and Unix emulators come equipped with them. The standard shell on Linux and other leading-edge Unix variants is now bash.


#### 14.4.3.1 Case Study: xmlto
xmlto is a driver script that calls all the commands needed to render an XML-DocBook document as HTML, PostScript, plain text, or in any one of several other formats (we’ll take a closer look at DocBook in Chapter 18). It is written in bash.

xmlto handles the details of calling an XSLT engine with appropriate stylesheet, then handing off the result to a postprocessor. For HTML and XHTML the XSLT transformation does the entire job. For plain text, the XML is also processed into HTML, but then handed to a postprocessor—lynx(1) in its -dump mode, which renders HTML to flat text. For PostScript, the XML is transformed to XML FO (formatting objects) which a postprocessor then massages into TEX macros, to DVI format via tex(1), and then finally to PostScript via the well-known dvi2ps(1) tool.

xmlto consists of a single front-end shellscript. It calls any one of several script plugins, each named after the target format. Each plugin is a shellscript. Depending on how it’s called, it either supplies a stylesheet for the front end to apply, or calls the appropriate postprocessor(s) with various canned arguments.

This architecture means that all the information about a given output format lives in one place (the corresponding script plugin), so adding new output types can be done without disturbing the front-end code at all.

xmlto is a good example of a medium-sized shell application. Neither C nor C++ would have made sense because they are awkward for scripting. Any of the other scripting languages in this chapter could have been used for this job; but it’s all simple command dispatching, with no internal data structures or complex logic, so shell is good enough. Shell has the significant advantage of being ubiquitous on the intended target systems.

In theory this script could run on any system supporting bash. The real constraint is the requirement for one of the XSLT engines and all the postprocessors needed to be present on the system. In practice, this script is not likely to run anywhere but under one of the modern open-source Unixes.


#### 14.4.3.2 Case Study: Sorcery Linux
Sorcerer GNU/Linux is a Linux distribution that you install as a small, bootable foothold system just powerful enough to run bash(1) and a couple of download utilities. With this code in place, you can invoke Sorcery, the Sorcerer package system.

Sorcery handles installing, removing, and integrity-checking software packages. When you “cast spells”, Sorcery downloads the source code, compiles it, installs it, and saves a list of files that were installed (along with a build log and checksums for all the files). Installed packages can be “dispelled” or removed. Package listing and integrity checks are also available. More details are available at the Sorcery project site <http://sorcerer.wox.org>.

The Sorcery system is written entirely in shell. Program installation procedures tend to be small, simple programs for which shell is appropriate. In this particular application, the main drawback of shell is neutralized because Sorcery’s authors can guarantee that the helper programs they need will be present in the foothold system.


#### 14.4.4 Perl
Perl is shell on steroids. It was specifically designed to replace awk(1), and expanded to replace shell as the ’glue’ for mixed-language script programming. It was first released in 1987.

Perl’s strongest point is its extremely powerful built-in facilities for pattern-directed processing of textual, line-oriented data formats; it is unsurpassed at this. It also includes far stronger data structures than shell, including dynamic arrays of mixed element types and a ’hash’ or ’dictionary’ type that supports convenient and fast lookup of name-value pairs.

Additionally, Perl includes a rather complete and well-thought-out internal binding of virtually the entire Unix API, drastically reducing the need for C and making it suitable for jobs like simple TCP/IP clients and even servers. Another strong advantage of Perl is that a large and vigorous open-source community has grown up around it. Its home on the net is the Comprehensive Perl Archive Network <http://www.cpan.org>. Dedicated Perl hackers have written hundreds of freely reusable Perl modules for many different programming tasks. These include everything from structure-walking of directory trees through X toolkits for GUI building, through excellent canned facilities for supporting HTTP robots and CGI programming.

Perl’s main drawback is that parts of it are irredeemably ugly, complicated, and must be used with caution and in stereotyped ways lest they bite (its argument-passing conventions for functions are a good example of all three problems). It is harder to get started in Perl than it is in shell. Though small programs in Perl can be extremely powerful, careful discipline is required to maintain modularity and keep a design under control as program size increases. Because some limiting design decisions early in Perl’s history could not be reversed, many of the more advanced features have a fragile, klugey feel about them.

The definitive reference on Perl is Programming Perl [Wall2000]. This book has nearly everything you will ever need to know in it, but is notoriously badly organized; you will have to dig to find what you want. A more introductory and narrative treatment is available in Learning Perl [Schwartz-Christiansen].

Perl is universal on Unix systems. Perl scripts at the same major release level tend to be readily portable between Unixes (provided they don’t use extension modules). Perl implementations are available (and even well documented) for the Microsoft family of operating systems and on MacOS as well. Perl/Tk provides cross-platform GUI capability.

Summing up: Perl’s best side is as a power tool for small glue scripts involving a lot of regular-expression grinding. Its worst side is that it is ugly, spiky, and nigh-unmaintainable in large volumes.


#### 14.4.4.1 A Small Perl Case Study: blq
The blq script is a tool for querying block lists (lists of Internet sites that have been identified as habitual sources of unsolicited bulk email, aka spam). You can find current sources at the blq project page <http://www.unicom.com/sw/blq/>.

blq is a good example of a small Perl script, illustrating both the strengths and weaknesses of the language. It makes intensive use of regular-expression matching. On the other hand, the Net::DNS Perl extension module it uses has to be conditionally included, because it is not guaranteed to be present in any given Perl installation.

blq is exceptionally clean and disciplined as Perl code goes, and I recommend it as an example of good style (the other Perl tools referenced from the blq project page are good examples as well). But parts of the code are unreadable unless you are familiar with very specific Perl idioms—the very first line of code, $0 =~ s!.*/!!;, is an example. While all languages have some of this kind of opacity, Perl has it worse than most.

Tcl and Python are both good for small scripts of this type, but both lack the Perl convenience features for regular-expression matching that blq uses heavily; an implementation in either would have been reasonable, but probably less compact and expressive. An Emacs Lisp implementation would have been even faster to write and more compact than the Perl one, but probably painfully slow to use.


#### 14.4.4.2 A Large Perl Case Study: keeper
keeper is the tool used to file incoming packages and maintain both FTP and WWW index files for the huge Linux free-software archives at ibiblio. You can find sources and documentation in the search tools subdirectory of the ibiblio archive <http://www.ibiblio.org>.

keeper is a good example of a medium-to-large interactive Perl application. The command-line interface is line-oriented and patterned after a specialized shell or directory editor; note the embedded help facilities. The working parts make heavy use of file and directory handling, pattern matching, and pattern-directed editing. Note the ease with which keeper generates Web pages and electronic-mail notifications from programmatic templates. Note also the use of a canned Perl module to automate walking various functions over directory trees.

At about 3300 lines, this application is probably pushing the size and complexity limit of what one should attempt in a single Perl program. Nevertheless, most of it was written in a period of six days. In C, C++ or Java it would have taken a minimum of six weeks and been extremely difficult to debug or modify after the fact. It is way too large for pure Tcl. A Python version would probably be structurally cleaner, more readable, and more maintainable—but also more verbose (especially near the pattern-matching parts). An Emacs Lisp mode could readily do the job, but Emacs is not well suited for use over a telnet link that is often slowed to a crawl by server congestion.


#### 14.4.5 Tcl
Tcl (Tool Command Language) is a small language interpreter designed to link with compiled C libraries, providing scripted control of C code (extended scripts). Its original application was to control libraries for electronic simulators (SPICE-like applications). Tcl is also suitable for embedded scripts—that is, scripts called from within C programs and returning values to those programs. Tcl had its first general public release in 1990.

Some facilities built on top of Tcl have achieved wide use outside the Tcl community itself. The two most important of these are:

• The Tk toolkit, a kinder and gentler X interface that makes it easy to rapidly build buttons, dialog boxes, menu trees, and scrolling text widgets and collect input from them.

• Expect, a language that makes it relatively easy to script fully interactive programs with widely variable responses.

The Tk toolkit is so important that the language is often referred to as Tcl/Tk. Tk is also frequently used with Perl and Python.

The main advantage of Tcl itself is that it is extremely flexible and radically simple. The syntax is very odd (based on a positional parser) but totally consistent. There are no reserved words, and there is no syntactic distinction between a function call and ’built in’ syntax; thus the Tcl language interpreter itself can be effectively redefined from within Tcl (which is what makes projects like Expect reasonable).

The main drawback of Tcl is that the pure language has only weak facilities for namespace control and modularity, and two of them (upvar and uplevel) are rather dangerous if not used with great caution. Also, there are no data structures other than association lists. Tcl therefore scales up very poorly—it is difficult to organize and debug pure Tcl programs of even moderate size (more than a few hundred lines) without tripping over your own feet. In practice, almost all large Tcl programs use one of several OO extensions to the language.

The oddities of the syntax can at first be a problem as well; the distinction between string quotes and braces will probably give you headaches for a while, and the rules for when things need to be quoted or braced are a bit tricky.

Pure Tcl only provides access to a relatively small and commonly used part of the Unix API (essentially just file handling, process-spawning, and sockets). Indeed, Tcl has the flavor of an experiment in seeing how small a scripting language can get and still be useful. Tcl extensions (similar to Perl modules) provide a richer set of capabilities, but are (like CPAN modules) not guaranteed to be installed everywhere.

The original Tcl reference is Tcl and the Tk Toolkit [Ousterhout94], but that book has been largely superseded by Practical Programming in Tcl and Tk [Welch]. Brian Kernighan has written a description of a real-world Tcl project [Kernighan95] that summarizes Tcl’s strengths and weaknesses as a rapid-prototyping and production tool; his contrast with Microsoft Visual Basic is particularly balanced and instructive.

The Tcl world doesn’t have one central repository run by a core group analogous to Perl’s or Python’s, but several excellent websites both point to each other and cover most Tcl tool and extension development. Look at the Tcl Developer Xchange <http://www.tcltk.com> first; among other things, it offers Tcl sources of an interactive Tcl tutorial. There is also a Tcl foundry at SourceForge <http://sourceforge.net/foundry/tcl-foundry/>.

Tcl scripts have portability problems similar to those of shell scripts; the language itself is highly portable, but the components it calls may not be. Tcl implementations exist for the Microsoft family of operating systems, MacOS, and many other platforms. Tcl/Tk scripts will run on any platform with GUI capabilities.

Summing up: Tcl’s best side is its spare, compact design and the extensibility of the Tcl interpreter. Its worst side is the odd positional parser and the weakness of its data structures and namespace controls; the latter defect makes it scale poorly for large projects.


#### 14.4.5.1 Case Study: TkMan
TkMan is a browser for Unix man pages and Texinfo documents. At roughly 1200 lines, it is quite large to be written in pure Tcl, but the code is unusually well-modularized and mature. It uses Tk to provide a GUI interface quite a bit nicer than either the stock man(1) or xman(1) utilities support.

TkMan makes a good case study because it exhibits almost the full gamut of Tcl techniques. Highlights include Tk integration, scripted control of other Unix applications (such as the Glimpse search engine), and the use of Tcl to parse Texinfo markup.

Any of the other languages would have made for a less direct interface to the Tk GUI that constitutes most of this code.

A Web search for “TkMan” should turn up sources and documentation.


#### 14.4.5.2 Moodss: A Large Tcl Case Study
The Moodss system is a graphical monitoring application for system administrators. It can watch logs and gather statistics for MySQL, Linux, SNMP networks, and Apache, and presents a digested view of them through spreadsheet-like GUI panels called ’dashboards’. Monitoring modules can be written in Python or Perl as well as Tcl. The code is polished, mature, and considered an exemplar in the Tcl community. There is a project website <http://jfontain.free.fr/moodss/>.

The Moodss core consists of about 18,000 lines of Tcl. It uses several Tcl extensions including a custom object system; the Moodss author admits that without these “writing such a big application would not have been possible”.

Again, any of the other languages would have made for a less direct interface to the Tk GUI that constitutes most of this code.


#### 14.4.6 Python
Python is a scripting language designed for close integration with C. It can both import data from and export data to dynamically loaded C libraries, and can be called as an embedded scripting language from C. Its syntax is rather like a cross between that of C and the Modula family, but has the unusual feature that block structure is actually controlled by indentation (there is no analog of explicit begin/end or C curly brackets). Python was first publicly released in 1991.

The Python language is a very clean, elegant design with excellent modularity features. It offers designers the option to write in an object-oriented style but does not force that choice (it can be coded in a more classically procedural C-like way). It has a type system comparable in expressive power to Perl’s, including dynamic container objects and association lists, but less idiosyncratic (actually, it is a matter of record that Perl’s object system was built in imitation of Python’s). It even pleases Lisp hackers with anonymous lambdas (function-valued objects that can be passed around and used by iterators). Python ships with the Tk toolkit, which can be used to easily build GUI interfaces.

The standard Python distribution includes client classes for most of the important Internet protocols (SMTP, FTP, POP3, IMAP, HTTP) and generator classes for HTML. It is therefore very well suited to building protocol robots and network administrative plumbing. It is also excellent for Web CGI work, and competes successfully with Perl at the high-complexity end of that application area.

Of all the interpreted languages we describe, Python and Java are the two most clearly suited for scaling up to large complex projects with many cooperating developers. In many ways Python is simpler than Java, and its friendliness to rapid prototyping may give it an edge over Java for standalone use in applications that are neither hugely complex nor speed critical. An implementation of Python in Java, designed to facilitate mixed use of these two languages, is available and in production use; it is called Jython.

Python cannot compete with C or C++ on raw execution speed (though using a mixed-language strategy on today’s fast processors probably makes that relatively unimportant). In fact it’s generally thought to be the least efficient and slowest of the major scripting languages, a price it pays for runtime type polymorphism. Beware of rejecting Python on these grounds, however; most applications do not actually need better performance than Python offers, and even those that appear to are generally limited by external latencies such as network or disk waits that entirely swamp the effects of Python’s interpretive overhead. Also, by way of compensation, Python is exceptionally easy to combine with C, so performance-critical Python modules can be readily translated into that language for substantial speed gains.

Python loses in expressiveness to Perl for small projects and glue scripts heavily dependent on regular-expression capability. It would be overkill for tiny projects, to which shell or Tcl might be better suited.

Like Perl, Python has a well-established development community with a central website <http://www.python.org> carrying a great many useful Python implementations, tools and extension modules.

The definitive Python reference is Programming Python [Lutz]. Extensive on-line documentation on Python extensions is also available at the Python website.

Python programs tend to be quite portable between Unixes and even across other operating systems; the standard library is powerful enough to significantly cut the use of nonportable helper programs. Python implementations are available for Microsoft operating systems and for MacOS. Cross-platform GUI development is possible with either Tk or two other toolkits. Python/C applications can be ’frozen’, quasi-compiled into pure C sources that should be portable to systems with no Python installed.

Summing up: Python’s best side is that it encourages clean, readable code and combines accessibility with scaling up well to large projects. Its worst side is inefficiency and slowness, not just relative to compiled languages but relative to other scripting languages as well.


#### 14.4.6.1 A Small Python Case Study: imgsizer
Imgsizer is a utility that rewrites WWW pages so that image-inclusion tags get the right image size parameters automatically plugged in (this speeds up page loading on many browsers). You can find sources and documentation in the URL WWW tools subdirectory of the ibiblio archive <http://www.ibiblio.org>.

imgsizer was originally written in Perl, and was a nearly ideal example of the sort of small, pattern-driven text-processing tool at which Perl excels. It was later translated to Python to take advantage of Python’s library support for HTTP fetching; this eliminated a dependency on an external page-fetching utility. Observe the use of file(1) and ImageMagick identify(1) as specialist tools for extracting the pixel sizes of images.

The dynamic string handling and sophisticated regular-expression matching required would have made imgsizer quite painful to write in C or C++; that version would also have been much larger and harder to read. Java would have solved the implicit memory-management problem, but is hardly more expressive than C or C++ at text pattern matching.


#### 14.4.6.2 A Medium-Sized Python Case Study: fetchmailconf
In Chapter 11 we examined the fetchmail/fetchmailconf pair as an example of one way to separate implementation from interface. Python’s strengths are well illustrated by fetchmailconf.

fetchmailconf uses the Tk toolkit to implement a multi-panel GUI configuration editor (Python bindings also exist for GTK+ and other toolkits, but Tk bindings ship with every Python interpreter).

In expert mode, the GUI supports editing of about sixty attributes divided among three panel levels. Attribute widgets include a mix of checkboxes, radio buttons, text fields, and scrolling listboxes. Despite this complexity, the first fully-functional version of the configurator took me less than a week to design and code, counting the four days it took to learn Python and Tk.

Python excels at rapid prototyping of GUI interfaces, and (as fetchmailconf illustrates) such prototypes are often deliverable. Perl and Tcl have similar strengths in this area (including the Tk toolkit, which was written for Tcl) but are hard to control at the complexity level (approximately 1400 lines) of fetchmailconf. Emacs Lisp is not suited for GUI programming. Choosing Java would have increased the complexity overhead of this programming task without delivering significant benefits for this nonspeed-intensive application.


#### 14.4.6.3 A Large Python Case Study: PIL
PIL, the Python Imaging Library, supports the manipulation of bitmap graphics. It supports many popular formats, including PNG, JPEG, BMP, TIFF, PPM, XBM, and GIF. Python programs can use it to convert and transform images; supported transformations include cropping, rotation, scaling, and shearing. Pixel editing, image convolution, and color-space conversions are also supported. The PIL distribution includes Python programs that make these library facilities available from the command line. Thus PIL can be used either for batch-mode image transformation or as a strong toolkit over which to implement program-driven image processing of bitmaps.

The implementation of PIL illustrates the way Python can be readily augmented with loadable object-code extensions to the Python interpreter. The library core, implementing fundamental operations on bitmap objects, is written in C for speed. The upper levels and sequencing logic are in Python, slower but much easier to read and modify and extend.

The analogous toolkit would be difficult or impossible to write in Emacs Lisp or shell, which don’t have or don’t document a C extension interface at all. Tcl has a good C extension facility, but PIL would be an uncomfortably large project in Tcl. Perl has such facilities (Perl XS), but they are ad-hoc, poorly documented, complex, and unstable by comparison to Python’s and use of them is rare. Java’s Native Method Interface appears to provide a facility roughly comparable to Python’s; PIL would probably have made a reasonable Java project.

The PIL code and documentation is available at the project website <http://www.pythonware.com/products/pil/>.


#### 14.4.7 Java
The Java programming language was designed to be “write once, run anywhere” and to support embedding interactive programs (or applets) in Web pages that would be runnable from any browser. Thanks to a series of technical and strategic blunders by its owner, Sun Microsystems, it has failed in both its original objectives. But it is still sufficiently strong at both systems and applications programming to be seriously challenging C and C++. Java was announced in 1995.

Java is cleverly designed to capture the huge benefit of automatic memory management and the lesser but not insignificant benefit of supporting OO design, while being far smaller and simpler than C++. It retains a broadly C-like syntax that most programmers will find comfortable. It includes support for callouts to dynamically-loaded C and calling Java as an embedded language from C. Nor is it trivial that Sun has done an excellent job of making good Java documentation available on the Web.

Against Java, we can say that (compared to, say, Python) some parts of it appear over-complex and others deficient. Java’s class-visibility and implicit-scoping rules are baroque. The interface facility avoids complex problems with multiple inheritance at the cost of being only slightly less difficult to understand and use in itself. Features like inner and anonymous classes can lead to very confusing code. The absence of reliable destructor methods means that it is difficult to ensure proper management of resources other than memory, such as mutexes and file locks. Significant parts of the Unix operating-system facilities are not accessible from stock Java, including signals, poll, and select. While Java’s I/O facilities are very powerful, simple reading of text files is not simple.

There is a particularly invidious problem, resembling Windows DLL hell, with libraries. Java has no method to manage different library versions. This can create huge problems in environments like application servers, where the server might come equipped with one version of (say) an XML library, but the application ships with a different (usually newer) version. The only handle on such problems is the CLASSPATH environment variable, a source of chronic deployment problems.

Furthermore, Sun’s handling of the Java language has been both politically and technically obtuse. Java’s first GUI toolkit, AWT, was a mess that had to be essentially replaced. Withdrawing the language from ECMA/ISO standardization further nettled many developers already upset by features of the Sun Community Source License (SCSL). Restrictions in the SCSL continue to hamper open-source implementations of Java 1.2 and their J2EE (Java 2 Enterprise Edition) specification. This compromises Java’s original objective of universal portability.

Sadly, browser applets are dead. Microsoft’s decision not to support Java 1.2 in Internet Explorer effectively killed them. However, Java seems to have found a secure niche in the computing ecology, for ’servlets’ running within Web application servers. It has also become commonly used for a lot of in-house corporate programming not directly tied to databases or webservers. It has become major competition for both Microsoft’s ASP/COM platform and Perl CGIs. Finally, it is in widespread and increasing use as a language for teaching introductory programming (a role for which it is extremely well suited).

Overall, we can fairly judge Java to be superior to C++ (which is both far more complex and does less to attack the memory-management problem) for all but systems programming and the most speed-critical applications. Experience seems to show that Java programmers are somewhat less likely to fall into the trap of excessive OO layering than are C++ programmers, though this remains a significant problem.

How Java will fare in equilibrium with the other languages we describe here is unclear as yet, and may depend largely on project scale. We may expect its proper niche to resemble Python’s. Like Python, it cannot compete with C or C++ on raw execution speed, nor against Perl on small projects that use pattern-driven editing heavily. It is (more definitely than Python) overkill for small projects. We may guess that Python will have an edge in smaller projects and Java in larger ones, but the verdict of experience is not yet in.

The best single reference on paper is probably Java In A Nutshell [FlanaganJava], but this is not the best tutorial introduction; that would probably be Thinking in Java [Eckel]. Trails to all the world’s Java websites begin at Sun’s Java site <http://java.sun.com>, which also has complete HTML documentation available for download for free. The Open Directory Java Page <http://dmoz.org/Computers/Programming/Languages/Java/> also collects useful Java links.

Java implementations are available for all Unixes, for Microsoft operating systems, MacOS, and many other platforms.

Sources for Kaffe, an open-source Java implementation with class libraries conforming to most of JDK 1.1 and portions of JDK 1.2, are available at the Kaffe project site <http://www.kaffe.org/>.

There is a Java front end for GCC. GCJ can compile Java code to either Java bytecode or native code, and can compile Java bytecode to native code as well. It comes packaged with open-source class libraries that implement most of JDK 1.2, and a Java bytecode interpreter called gij. Details are at the GCJ project page <http://gcc.gnu.org/java/>.

There is a Java IDE for Emacs at the JDEE project site <http://jdee.sunsite.dk/>.

Java portability is excellent at the language level. Incomplete library implementations (especially older JDK 1.1 versions that don’t support the newer JDK 1.2) can be an issue.

Java’s best side is that it comes close enough to achieving write-once-run-anywhere to be useful as an OS-independent environment of its own. Its worst side is that the Java 1/Java 2 split compromises that goal in deeply frustrating ways.


#### 14.4.7.1 Case Study: FreeNet
Freenet is a peer-to-peer networking project that is intended to make censorship and content suppression impossible.6 Freenet developers envision the following applications:

6 There is a Freenet project website <http://freenetproject.org>.

• Uncensorable dissemination of controversial information: Freenet protects freedom of speech by enabling anonymous and uncensorable publication of material ranging from grassroots alternative journalism to banned exposés.

• Efficient distribution of high-bandwidth content: Freenet’s adaptive caching and mirroring is being used to distribute Debian Linux software updates.

• Universal personal publishing: Freenet enables anyone to have a website, without space restrictions or compulsory advertising, even if the would-be webmaster doesn’t own a computer.

Freenet addresses these goals by providing a virtual space in which to publish documents that is not tied to any specific machine. Published information and Freenet’s own internal data indexes are replicated and distributed across the network in such a way that even Freenet administrators don’t know at any given time where all the physical copies are located. Privacy for people browsing or submitting to Freenet is protected by strong cryptography.

Java was a good choice for this project for at least two reasons. First: the goals of the project put a heavy premium on having compatible implementations on the widest possible variety of machines, so Java’s high portability is a dominating advantage. Second: the nature of the project is such that the network API is important, and Java has a strong one built in.

C is traditional for infrastructure projects of this kind that have high performance demands, but the lack of a standardized network API would have made porting a significant difficulty. C++ would have had the same difficulty. Tcl, Perl, or Python might have reduced the porting burden, but at a greater cost in performance. Emacs Lisp  would have been painfully slow and totally inappropriate.


#### 14.4.8 Emacs Lisp
Emacs Lisp is a scripting language used to program the behavior of the Emacs text editor. Its first public release was in 1984.

Emacs Lisp is not a general-purpose language in quite the same way as the others surveyed in this chapter; while it is powerful enough to theoretically be used as such, it is traditionally employed only to write control programs for the Emacs editor itself and does not communicate as fluently with other software as would a modern scripting language.

Nevertheless, there is a significant range of applications in which Emacs Lisp is more effective than anything else. Many of these have to do with providing a front-end for development tools such as the C compiler and linker, make(1), version-control systems, and symbolic debuggers; we’ll discuss these in Chapter 15.

More generally, Emacs is to pattern- or syntax-directed interactive editing what Perl is to pattern-directed batch editing. Any application that involves interactively hacking a special file format or text database is an excellent candidate to be prototyped (and possibly delivered) as an Emacs mode (an Emacs Lisp program that specializes the editor’s behavior).

Emacs Lisp is also valuable for building applications that have to be closely integrated with a text editor, or that function primarily as text browsers with some editing capability. User agents for email and Usenet news fall in this category. So do certain kinds of database front ends.

Emacs Lisp is a Lisp. It follows as the night the day that it manages memory automatically and is far more elegant and powerful than most conventional languages, or indeed most unconventional languages; it can compete with Java or Python on this level and laugh at C or C++, Perl, shell or Tcl. Lisp’s perennial problem of lacking a standardized OS binding for portability is solved by the Emacs core, which in effect is its OS binding.

Lisp’s other perennial problem—being a resource hog—is no longer a real issue on modern machines. Parody expansions like ’Emacs Makes A Computer Slow’ and ’Eventually Munches All Computer Storage’ used to be common (in fact the Emacs distribution itself includes a list of them). But many other commonly used categories of programs (such as Web browsers) have nowadays grown larger and more complex than Emacs, which has come to appear rather moderate by comparison.

The definitive Emacs Lisp reference is The GNU Emacs Lisp Reference Manual, which may be browseable through your Emacs’s ’info’ help system. If not, it can be downloaded from the FSF FTP site <ftp://ftp.gnu.org/pub/gnu>. If you find that impenetrable, Writing GNU Emacs Extensions [Glickstein] may help.

Portability of Emacs Lisp programs is excellent. Emacs implementations are available for all Unixes, the Microsoft operating systems, and Mac OS.

Summing up: Emacs Lisp’s best point is that it combines an excellent base language, Lisp, with powerful domain primitives for text manipulation. Its worst point is poor performance and difficulties using it in communication with other programs.

For more information, see the discussion of Emacs under editors in the next chapter.


### 14.5 Trends for the Future
Table 14.1 gives a rough indication of today’s distribution of language usage. We give figures from both SourceForge7 and Freshmeat,8 the two most important new-release sites, as of March 2003.

7 Query for statistics <http://sourceforge.net/softwaremap/trove_list.php?form_cat=160>.

8 Query for statistics <http://freshmeat.net/browse/160/?topic_id=160>.

The SourceForge figures are soft in several ways: Notably, SourceForge’s query interface doesn’t permit filtering on OS and language simultaneously, so some of these numbers represent MacOS and Windows projects. The effect is probably to exaggerate C++ and Java’s share considerably. However, Unix-based projects dominate sufficiently (by about a 3:1 ratio) so that the effect on the figures for languages other than these is probably not too distorting.

The Freshmeat sample is smaller, but the site hosts only Unix-based releases—and it counts actual releases, not the huge clutter of failed and inactive SourceForge projects. It is thus interesting that the population figures track SourceForge’s by about a 1:2 ratio except in precisely the cases (C++ and Java) where we would expect them to be out of proportion because of the absence of Windows projects.

This chapter was first drafted in 1997; at time of writing it is mid-2003. That is a long enough time base that the relative positions of the languages we surveyed above have changed somewhat since first writing, indicating adoption trends that may suggest what their futures will be like. (Community size is an important predictor of the quality and amount of work that will go into improving the most-used open-source implementations of these languages; both growth and decline tend to be self-reinforcing.)

Broadly speaking, C and C++ and Emacs Lisp have remained stable across the 1997–2003 time period, appealing to much the same constituencies in 2003 as they did in 1997. C has gained slowly at the expense of older conventional languages such as FORTRAN; C++, on the other hand, has lost some ground to Java.

Perl usage has grown respectably, but the language itself has been stagnant for some time. Perl’s internals are notoriously grubby; it’s been understood for years that the language’s implementation needs to be rewritten from scratch, but an attempt in 1999 failed and another seems presently stalled in mid-2003. Nevertheless, Perl is still the 800-pound gorilla of scripting languages, and dominates Web scripting and CGI.

Tcl has been in a period of relative decline, or at least of diminishing visibility. In 1996 a widely-reported and plausible estimate of community sizes held that for every Python hacker there were five Tcl hackers and twelve Perl hackers. Today the SourceForge figures suggest those ratios are about 3:1:7. However, Tcl is reported to be very widely used for scripting of specialized components in several industries, including electronic design automation, radio and television broadcasting, and the film industry.


Table 14.1. Language choices.

images

Python has risen in popularity as rapidly as Tcl has fallen. Though the Perl community is still twice the size of Python’s, a visible tendency of the brightest Perl hackers to migrate to Python has been rather ominous for the former language—especially as there is no migration at all in the opposite direction.

Java has become widely used at sites already invested in Sun Microsystems technology and is in increasing deployment as an instructional language in undergraduate computer science curricula. Elsewhere, however, it is only marginally more popular than it was in 1997. Sun’s determination to stick to a proprietary licensing model has prevented the major breakout many observers then predicted; under Linux and in the wider open-source community Java has not made the headway against C that it has elsewhere.

No new general-purpose language has emerged to seriously challenge those we’ve surveyed here. PHP is making inroads in Web development, challenging Perl CGIs (as well as ASP and server-side Java) but is almost never used for standalone programming. Non-Emacs Lisp dialects, a once-promising area that seemed headed for a renaissance in the mid-1990s, have continued to fade. Recent efforts such as Ruby (a sort of Python-Perl-Smalltalk cross developed in Japan) and Squeak (an open-source Smalltalk port) look promising, but have so far neither attracted hackers far outside their development groups nor demonstrated staying power.


### 14.6 Choosing an X Toolkit
An issue related to choice of language is choice of X toolkit for GUI programming. Recall the discussion in Chapter 1 of how X separates mechanism from policy. Each possible choice of toolkit will give you a slightly different look and feel.

Your choice of X toolkit will be connected to your choice of application language in two ways: first, because some languages ship with a binding to a preferred toolkit, and second because some toolkits only have bindings to a limited set of languages.

Java, of course, has its own cross-platform toolkits built in, so your choice will be between AWT (universally deployed) and Swing (more capable, more complex, slower, and only in JDK 1.2/Java 2). The remainder of this section focuses on the other languages we have surveyed. Similarly, if you’re using Tcl, Tk comes bundled. There probably is not a lot of point in evaluating alternatives.

The once-ubiquitous Motif toolkit is effectively dead. It couldn’t keep up with the newer toolkits distributed without license fees or restrictions. These attracted more developer effort until they surged past closed-source toolkits in capability and features; nowadays, the competition is all in open source.

The four toolkits to consider seriously in 2003 are Tk, GTK, Qt, and wxWindows, with GTK and Qt being the clear front runners. All four have ports on MacOS and Windows, so any choice will give you the capability to do cross-platform development.

The Tk toolkit is the oldest of the four and has the advantage of incumbency; it’s native in Tcl and bindings to it are shipped with the stock version of Python. Libraries to provide language bindings to Tk are generally available for C and C++. Unfortunately, Tk also shows its age in that its standard widget set is both limited and rather ugly. On the other hand, the Tk Canvas widget has capabilities that other toolkits still match only with difficulty.

GTK began life as a replacement for Motif, and was invented to support the GIMP. It is now the preferred toolkit of the GNOME project and is used by hundreds of GNOME applications. The native API is C; bindings are available for C++, Perl, and Python, but do not ship with the stock language distributions. It’s the only one of these four with a native C binding.

Qt is a toolkit associated with the KDE project. It is natively a C++ library; bindings are available for Python and Perl but do not ship with the stock interpreters. Qt has a reputation for having the best-designed and most expressive API of these four, but adoption was initially hindered by controversy over early versions of the Qt license and was further slowed down by the fact that a C binding was slow in coming.

wxWindows is also natively C++ with bindings available in Perl and Python. The wxWindows developers emphasize their support for cross-platform development heavily and appear to regard it as the main selling point of the toolkit. Another selling point is that wxWindows is actually a wrapper around the native (GTK, Windows, and MacOS 9) widgets on each platform, so applications written using it retain a native look and feel.

As of mid-2003 few detailed comparisons have been written, but a Web search for “X toolkit comparison” may turn up some useful hits. Table 14.2 summarizes the state of play.


Table 14.2. Summary of X toolkits.

images

Architecturally, these libraries are all written at about the same abstraction level. GTK and Qt use a slot-and-signal apparatus for event-handling so similar that ports between them have been reported to be almost trivial. Your choice among them will probably be conditioned more by the availability of bindings to your chosen development language than anything else.

## 15. Tools: The Tactics of Development

Unix is user-friendly—it’s just choosy about who its friends are.

—Anonymous


### 15.1 A Developer-Friendly Operating System
Unix has a long-established reputation as a good environment to develop under. It’s well equipped with tools written by programmers for programmers. These automate away many of the grubby little tasks that would otherwise distract you from concentrating on the most important (and most enjoyable!) aspect of development—your design.

While all the tools you’ll need are there and individually well documented, they’re not knit together by an integrated development environment (IDE). Finding and assembling them into a kit that suits your needs has traditionally taken considerable effort.

If you’re used to a good IDE—the kind of GUI-driven combination of editor, configuration-manager, compiler, and debugger now common on Macintosh and Windows systems—the Unix approach may seem casual, murky, and primitive. But there’s actually method in it.

IDEs make a lot of sense for single-language programming in a tool-poor environment. If what you’re doing is confined to grinding out C or C++ code by hand and the yard, they’re quite appropriate. Under Unix, however, your languages and implementation options are a lot more varied. It’s common to use multiple code generators, custom configurators, and many other standard and custom tools.

IDEs do exist under Unix (there are several good open-source ones, including emulations of the major Macintosh and Windows IDEs). But it’s difficult to control an open-ended variety of programming tools with them, and they’re not much used. Unix encourages a more flexible style, one less exclusively centered on the edit/compile/debug loop.

In this chapter we introduce you to the tactics of development under Unix—building code, managing code configurations, profiling, debugging, and automating away a lot of the drudgery associated with these tasks so you can concentrate on the fun parts. As usual, the exposition focuses more on the architectural picture than the how-to details. When you want how-to details, most of the tools in this chapter are well described in Programming with GNU Software [Loukides-Oram].

Many of these tools automate things that you could do yourself by hand, albeit more slowly and with a higher error rate. The one-time cost of climbing the learning curve should be more than paid off by the ability to write programs more efficiently, and spend less attention on low-level details and more on design.

Unix programmers traditionally learn how to use these tools by osmosis from other programmers, and by exploration over a period of years. If you’re a novice, pay careful attention; we’re going to try to jump you over a big section of the Unix learning curve by showing you what is possible right at the outset. If you are an experienced Unix programmer in a hurry, you can skip this chapter—but maybe you shouldn’t. There might just be some bit of useful lore here that even you don’t know.


### 15.2 Choosing an Editor
The first and most basic tool of development is a text editor suitable for modifying and writing programs.

Literally dozens of text editors are available under Unix; writing one seems to be one of the standard finger exercises for budding open-source hackers. Most of these are ephemera, not suitable for extended use by anyone other than their authors. A few are emulations of non-Unix editors, useful as transition aids for programmers used to other operating systems. You can browse through a wide variety at SourceForge or ibiblio or any other major open-source archive.

For serious editing work, two editors completely dominate the Unix programming scene. Each is available in a couple of minor variant implementations, but has a standard version you can rely on finding on any modern Unix system. These two editors are vi and Emacs. We discussed them in Chapter 13 as part of our discussion of the right size of software.

As we noted in Chapter 13, these two editors express sharply contrasting design philosophies, but both are extremely popular and command great loyalty from identifiable core user populations. Surveys of Unix programmers consistently indicate about a 50/50 split between them, with all other editors barely registering.

In our earlier examinations of vi and Emacs, we were primarily concerned with their optional complexity and the surrounding design-philosophy issues. Many other things are worth knowing about these editors, both as a matter of practicality and of Unix cultural literacy.


#### 15.2.1 Useful Things to Know about vi
The name of vi is an abbreviation for “visual editor” and is pronounced /vee eye/ (not /vie/ and definitely not /siks/!).

vi was not quite the earliest screen-oriented editor; that palm goes to the Rand editor, re, that ran on Version 6 Unix in the 1970s. But vi is the longest-lived screen-oriented editor built for Unix that is still in use, and is a hallowed part of Unix tradition.

The original vi was the version present in the earliest BSD software distributions beginning in 1976; it is now obsolete. Its replacement was ’new vi’ which shipped with 4.4BSD and is found on modern 4.4BSD variants such as BSD/OS, FreeBSD, and NetBSD systems. There are several variants with extended features, notably vim, vile, elvis, and xvi; of these vim is probably the most popular and is found on many Linux systems. All the variants are rather similar and share a core command set unchanged from the original vi.

Ports of vi are available for the Windows operating systems and MacOS.

Most introductory Unix books include a chapter describing basic vi usage. One place a vi FAQ is available is the Editor FAQ/vi <http://www.faqs.org/faqs/editor-faq/vi/>; you can find many other copies with a WWW keyword search for page titles including “vi” and “FAQ”.


#### 15.2.2 Useful Things to Know about Emacs
Emacs stands for ’EDiting MACroS’ (pronounce it /ee´·maks/). It was originally written in the late 1970s as a set of macros in an editor called TECO, then reimplemented several times in different ways. In an amusing twist, modern Emacs implementations include a TECO emulation mode.

In our earlier discussion of editors and optional complexity, we noted that many people consider Emacs excessively heavyweight. However, investing the time to learn it can yield rich rewards in productivity. Emacs supports many powerful editing modes that offer help with the syntax of various programming languages and markups. We’ll see later in this chapter how Emacs can be used in combination with other development tools to give capabilities comparable to (and in many ways surpassing) those of conventional IDEs.

The standard Emacs, universally available on modern Unixes, is GNU Emacs; this is what generally runs if you type emacs to a Unix shell prompt. GNU Emacs sources and documentation are available at the Free Software Foundation archive site <ftp://gnu.org/pub/gnu>.

The only major variant is called XEmacs; it has a better X interface but otherwise quite similar capabilities (it forked from Emacs 19). XEmacs has a home page <http://www.xemacs.org>. Emacs (and Emacs Lisp) is universally available under modern Unixes. It has been ported to MS-DOS (where it works poorly) and Windows 95 and NT (where it is said to work reasonably well).

Emacs includes its own interactive tutorial and very complete on-line documentation; you’ll find instructions on how to invoke both on the default Emacs startup screen. A good introduction on paper is Learning GNU Emacs [Cameron].

The keystroke commands used in the Unix ports of Netscape/Mozilla and Internet Explorer text windows (in forms and the mailer) are copied from the stock Emacs bindings for basic text editing. These bindings are the closest thing to a cross-platform standard for editor keystrokes.


#### 15.2.3 The Antireligious Choice: Using Both
Many people who regularly use both vi and Emacs tend to use them for different things, and find it valuable to know both.

In general, vi is best for small jobs—quick replies to mail, simple tweaks to system configuration, and the like. It is especially useful when you’re using a new system (or a remote one over a network) and don’t have your Emacs customization files handy.

Emacs comes into its own for extended editing sessions in which you have to handle complex tasks, modify multiple files, and use results from other programs during the session. For programmers using X on their console (which is typical on modern Unixes), it’s normal to start up Emacs shortly after login time in a large window and leave it running forever, possibly visiting dozens of files and even running programs in multiple Emacs subwindows.


### 15.3 Special-Purpose Code Generators
Unix has a long-standing tradition of hosting tools that are specifically designed to generate code for various special purposes. The venerable monuments of this tradition, which go back to Version 7 and earlier days, and were actually used to write the original Portable C Compiler back in the 1970s, are lex(1) and yacc(1) Their modern, upward-compatible successors are flex(1) and bison(1), part of the GNU toolkit and still heavily used today. These programs have set an example that is carried forward in projects like GNOME’s Glade interface builder.


#### 15.3.1 yacc and lex
yacc and lex are tools for generating language parsers. We observed in Chapter 8 that your first minilanguage is all too likely to be an accident rather than a design. That accident is likely to have a hand-coded parser that costs you far too much maintenance and debugging time—especially if you have not realized it is a parser, and have thus failed to properly separate it from the remainder of your application code. Parser generators are tools for doing better than an accidental, ad-hoc implementation; they don’t just let you express your grammar specification at a higher level, they also wall off all the parser’s implementation complexity from the rest of your code.

If you reach a point where you are planning to implement a minilanguage from scratch, rather than by extending or embedding an existing scripting language or parsing XML, yacc and lex will probably be your most important tools after your C compiler.

lex and yacc each generate code for a single function—respectively, “get a token from the input stream” and “parse a sequence of tokens to see if it matches a grammar”. Usually, the yacc-generated parser function calls a Lex-generated tokenizer function each time it wants to get another token. If there are no user-written C callbacks at all in the yacc-generated parser, all it will do is a syntax check; the value returned will tell the caller if the input matched the grammar it was expecting.

More usually, the user’s C code, embedded in the generated parser, populates some runtime data structures as a side-effect of parsing the input. If the minilanguage is declarative, your application can use these runtime data structures directly. If your design was an imperative minilanguage, the data structures might include a parse tree which is immediately fed to some kind of evaluation function.

yacc has a rather ugly interface, through exported global variables with the name prefix yy_. This is because it predates structs in C; in fact, yacc predates C itself; the first implementation was written in C’s predecessor B. The crude though effective algorithm yacc-generated parsers use to try to recover from parse errors (pop tokens until an explicit error production is matched) can also lead to problems, including memory leaks.

If you are building parse trees, using malloc to make nodes, and you start popping things off the stack in error recovery, you don’t get to recover (free) the storage. In general, Yacc can’t do it, since it doesn’t know enough about what’s on the stack. If the yacc parser were in C++, it could assume that the values were classes and “destruct” them. In “real” compilers, parse tree nodes are generated using an arena-based allocator, so the nodes don’t leak, but there is a logical leak anyway that needs to be thought about to make industrial-strength error recovery.

—Steve Johnson

lex is a lexical analyzer generator. It’s a member of the same functional family as grep(1) and awk(1), but more powerful because it enables you to arrange for arbitrary C code to be executed on each match. It accepts a declarative minilanguage and emits skeleton C code.

A crude but useful way to think about what a lex-generated tokenizer does is as a sort of inverse grep(1). Where grep(1) takes a single regular expression and returns a list of matches in the incoming data stream, each call to a lex-generated tokenizer takes a list of regular expressions and indicates which expression occurs next in the datastream.

Splitting input analysis into tokenizing input and parsing the token stream is a useful tactic even if you’re not using Yacc and Lex and your “tokens” are nothing like the usual ones in a compiler. More than once I’ve found that splitting input handling into two levels made the code much simpler and easier to understand, despite the complexity added by the split itself.

—Henry Spencer

lex was written to automate the task of generating lexical analyzers (tokenizers) for compilers. It turned out to have a surprisingly wide range of uses for other kinds of pattern recognition, and has since been described as “the Swiss-army knife of Unix programming”.1

1 The common latter-day description of Perl as a “Swiss-army chainsaw” is derivative.

If you are attacking any kind of pattern-recognition or state-machine problem in which all the possible input stimuli will fit in a byte, lex may enable you to generate code that will be more efficient and reliable than a hand-crafted state machine.

John Jarvis at Holmdel [an AT&T laboratory] used lex to find faults in circuit boards, by scanning the board, using a chain-encoding technique to represent the edges of areas on the board, and then using Lex to define patterns that would catch common fabrication errors.

—Mike Lesk

Most importantly, the lex specification minilanguage is much higher-level and more compact than equivalent handcrafted C. Modules are available to use flex, the open-source version, with Perl (find them with a Web search for “lex perl”), and a work-alike implementation is part of PLY in Python.

lex generates parsers that are up to an order of magnitude slower than hand-coded parsers. This is not a good reason to hand-code, however; it’s an argument for prototyping with lex and hand-hacking only if prototyping reveals an actual bottleneck.

yacc is a parser generator. It, too, was written to automate part of the job of writing compilers. It takes as input a grammar specification in a declarative minilanguage resembling BNF (Backus-Naur Form) with C code associated with each element of the grammar. It generates code for a parser function that, when called, accepts text matching the grammar from an input stream. As each grammar element is recognized, the parser function runs the associated C code.

The combination of lex and yacc is very effective for writing language interpreters of all kinds. Though most Unix programmers never get to do the kind of general-purpose compiler-building that these tools were meant to assist, they’re extremely useful for writing parsers for run-control file syntaxes and domain-specific minilanguages.

lex-generated tokenizers are very fast at recognizing low-level patterns in input streams, but the regular-expression minilanguage that lex knows is not good at counting things, or recognizing recursively nested structures. For parsing those, you want yacc. On the other hand, while you theoretically could write a yacc grammar to do its own token-gathering, the grammar to specify that would be hugely bloated and the parser extremely slow. For tokenizing input, you want lex. Thus, these tools are symbiotic.

If you can implement your parser in a higher-level language than C (which we recommend you do; see Chapter 14 for discussion), then look for equivalent facilities like Python’s PLY (which covers both lex and yacc)2 or Perl’s PY and Parse::Yapp modules, or Java’s CUP,3 Jack,4 or Yacc/M5 packages.

2 PLY is downloadable <http://systems.cs.uchicago.edu/ply/>.

3 CUP is downloadable <http://www.cs.princeton.edu/~appel/modern/java/CUP/>.

4 Jack is downloadable <http://www.javaworld.com/javaworld/jw-12-1996/jw-12-jack.html>.

5 Yacc/M is downloadable <http://david.tribble.com/yaccm.html>.

As with macro processors, one of the problems with code generators and preprocessors is that compile-time errors in the generated code may carry line numbers that are relative to the generated code (which you don’t want to edit) rather than the generator input (which is where you need to make corrections). yacc and lex address this by generating the same #line constructs that the C preprocessor does; these set the current line number for error reporting so the numbers will come out right. Any program that generates C or C++ should do likewise.

More generally, well-designed procedural-code generators should never require the user to hand-alter or even look at the generated parts. Getting those right is the code generator’s job.


#### 15.3.1.1 Case Study: The fetchmailrc Grammar
The canonical demonstration example that seems to have appeared in every lex and yacc tutorial ever written is a toy interactive calculator program that parses and evaluates arithmetic expressions entered by the user. We will spare you yet another repetition of this cliche; if you are interested, consult the source code of the bc(1) and dc(1) calculator implementations from the GNU project, or the paradigm example ’hoc’6 from [Kernighan-Pike84].

6 <http://cm.bell-labs.com/cm/cs/upe/>

Instead, the grammar of fetchmail’s run-control-file parser provides a good medium-sized case study in lex and yacc usage. There are a couple of points of interest here.

The lex specification, in rcfile_l.l, is a very typical implementation of a shell-like syntax. Note how two complementary rules support either single or double-quoted strings; this is a good idea in general. The rules for accepting (possibly signed) integer literals and discarding comments are also pretty generic.

The yacc specification, in rcfile_y.y, is long but straightforward. It does not perform any fetchmail actions, just sets bits in a list of internal control blocks. After startup, fetchmail’s normal mode of operation is just to repeatedly walk that list, using each record to drive a retrieval session with a remote site.


#### 15.3.2 Case Study: Glade
We looked at Glade in Chapter 8 as a good example of a declarative minilanguage. We also noted that its back end produces a result by generating code in any one of several languages.

Glade is a good modern example of an application-code generator. What makes it Unixy in spirit are the following features, which most GUI builders (especially most proprietary GUI builders) don’t have:

• Rather than being glued together as one monster monolith, the Glade GUI and Glade code generator obey the Rule of Separation (following the “separated engine and interface” design pattern).

• The GUI and code generator are connected by an (XML-based) textual data file format that can be read and modified by other tools.

• Multiple target languages (as opposed to just C or C++) are supported. More could easily be added.

The design implies that it should also be possible to replace the Glade GUI editor component, should that ever become desirable.


### 15.4 make: Automating Your Recipes
Program sources by themselves don’t make an application. The way you put them together and package them for distribution matters, too. Unix provides a tool for semi-automating these processes; make(1). Make is covered in most introductory Unix books. For a really thorough reference, you can consult Managing Projects with Make [Oram-Talbot]. If you’re using GNU make (the most advanced make, and the one normally shipped with open-source Unixes) the treatment in Programming with GNU Software [Loukides-Oram] may be better in some respects. Most Unixes that carry GNU make will also support GNU Emacs; if yours does you will probably find a complete make manual on-line through Emacs’s info documentation system.

Ports of GNU make to DOS and Windows are available from the FSF.


#### 15.4.1 Basic Theory of make
If you’re developing in C or C++, an important part of the recipe for building your application will be the collection of compilation and linkage commands needed to get from your sources to working binaries. Entering these commands is a lot of tedious detail work, and most modern development environments include a way to put them in command files or databases that can automatically be re-executed to build your application.

Unix’s make(1) program, the original of all these facilities, was designed specifically to help C programmers manage these recipes. It lets you write down the dependencies between files in a project in one or more ’makefiles’. Each makefile consists of a series of productions; each one tells make that some given target file depends on some set of source files, and says what to do if any of the sources are newer than the target. You don’t actually have to write down all dependencies, as the make program can deduce a lot of the obvious ones from filenames and extensions.

For example: You might put in a makefile that the binary myprog depends on three object files myprog.o, helper.o, and stuff.o. If you have source files myprog.c, helper.c, and stuff.c, make will know without being told that each .o file depends on the corresponding .c file, and supply its own standard recipe for building a .o file from a .c file.

Make originated with a visit from Steve Johnson (author of yacc, etc.), storming into my office, cursing the Fates that had caused him to waste a morning debugging a correct program (bug had been fixed, file hadn’t been compiled, cc *.o was therefore unaffected). As I had spent a part of the previous evening coping with the same disaster on a project I was working on, the idea of a tool to solve it came up. It began with an elaborate idea of a dependency analyzer, boiled down to something much simpler, and turned into Make that weekend. Use of tools that were still wet was part of the culture. Makefiles were text files, not magically encoded binaries, because that was the Unix ethos: printable, debuggable, understandable stuff.

—Stuart Feldman

When you run make in a project directory, the make program looks at all productions and timestamps and does the minimum amount of work necessary to make sure derived files are up to date.

You can read a good example of a moderately complex makefile in the sources for fetchmail. In the subsections below we’ll refer to it again.

Very complex makefiles, especially when they call subsidiary makefiles, can become a source of complications rather than simplifying the build process. A now-classic warning is issued in Recursive Make Considered Harmful.7 The argument in this paper has become widely accepted since it was written in 1997, and has come near to reversing previous community practice.

7 Available on the Web <http://www.tip.net.au/~millerp/rmch/recu-make-cons-harm.html>.

No discussion of make(1) would be complete without an acknowledgement that it includes one of the worst design botches in the history of Unix. The use of tab characters as a required leader for command lines associated with a production means that the interpretation of a makefile can change drastically on the basis of invisible differences in whitespace.

Why the tab in column 1? Yacc was new, Lex was brand new. I hadn’t tried either, so I figured this would be a good excuse to learn. After getting myself snarled up with my first stab at Lex, I just did something simple with the pattern newline-tab. It worked, it stayed. And then a few weeks later I had a user population of about a dozen, most of them friends, and I didn’t want to screw up my embedded base. The rest, sadly, is history.

—Stuart Feldman


#### 15.4.2 make in Non-C/C++ Development
make is not just useful for C/C++ recipes, however. Scripting languages like those we described in Chapter 14 may not require conventional compilation and link steps, but there are often other kinds of dependencies that make(1) can help you with.

Suppose, for example, that you actually generate part of your code from a specification file, using one of the techniques from Chapter 9. You can use make to tie the spec file and the generated source together. This will ensure that whenever you change the spec and remake, the generated code will automatically be rebuilt.

It’s quite common to use makefile productions to express recipes for making documentation as well as code. You’ll often see this approach used to automatically generate PostScript or other derived documentation from masters written in some markup language (like HTML or one of the Unix document-macro languages we’ll survey in Chapter 18). In fact, this sort of use is so common that it’s worth illustrating with a case study.


#### 15.4.2.1 Case Study: make for Document-File Translation
In the fetchmail makefile, for example, you’ll see three productions that relate files named FAQ, FEATURES, and NOTES to HTML sources fetchmail-FAQ.html, fetchmail-features.html, and design-notes.html.

The HTML files are meant to be accessible on the fetchmail Web page, but all the HTML markup makes them uncomfortable to look at unless you’re using a browser. So the FAQ, FEATURES, and NOTES are flat-text files meant to be flipped through quickly with an editor or pager program by someone reading the fetchmail sources themselves (or, perhaps, distributed to FTP sites that don’t support Web access).

The flat-text forms can be made from their HTML masters by using the common open-source program lynx(1). lynx is a Web browser for text-only displays; but when invoked with the -dump option it functions reasonably well as an HTML-to-ASCII formatter.

With the productions in place, the developer can edit the HTML masters without having to remember to manually rebuild the flat-text forms afterwards, secure in the knowledge that FAQ, FEATURES, and NOTES will be properly rebuilt whenever they are needed.


#### 15.4.3 Utility Productions
Some of the most heavily used productions in typical makefiles don’t express file dependencies at all. They’re ways to bundle up little procedures that a developer wants to mechanize, like making a distribution package or removing all object files in order to do a build from scratch.

Nonfile productions were intentional and in there from day one. ’Make all’ and ’clean’ were my own conventions from earliest days. One of the older Unix jokes is “Make love” which results in “Don’t know how to make love”.

—Stuart Feldman

There is a well-developed set of conventions about what utility productions should be present and how they should be named. Following these will make your makefile much easier to understand and use.

all

Your all production should make every executable of your project. Usually the all production doesn’t have an explicit rule; instead it refers to all of your project’s top-level targets (and, not accidentally, documents what those are). Conventionally, this should be the first production in your makefile, so it will be the one executed when the developer types make with no argument.

test

Run the program’s automated test suite, typically consisting of a set of unit tests8 to find regressions, bugs, or other deviations from expected behavior during the development process. The ’test’ production can also be used by end-users of the software to ensure that their installation is functioning correctly.

8 A unit test is test code attached to a module to verify correct performance. Use of the term ’unit test’ suggests that the test is written concurrently with the code by the developer of the code, and implies a discipline in which module releases aren’t considered complete until they have attached test code. The term and the concept originated in the “Extreme Programming” methodology popularized by Kent Beck, but has gained wide acceptance among Unix programmers since about 2001.

clean

Remove all files (such as binary executables and object files) that are normally created when you make all. A make clean should reset the process of building the software to a good initial state.

dist

Make a source archive (usually with the tar(1) program) that can be shipped as a unit and used to rebuild the program on another machine. This target should do the equivalent of depending on all so that a make dist automatically rebuilds the whole project before making the distribution archive—this is a good way to avoid last-minute embarrassments, like not shipping derived files that are actually needed (like the flat-text README in fetchmail, which is actually generated from an HTML source).

distclean

Throw away everything but what you would include if you were bundling up the source with make dist. This may be the the same as make clean but should be included as a production of its own anyway, to document what’s going on. When it’s different, it usually differs by throwing away local configuration files that aren’t part of the normal make all build sequence (such as those generated by autoconf(1); we’ll talk about autoconf(1) in Chapter 17).

realclean

Throw away everything you can rebuild using the makefile. This may be the same as make distclean, but should be included as a production of its own anyway, to document what’s going on. When it’s different, it usually differs by throwing away files that are derived but (for whatever reason) shipped with the project sources anyway.

install

Install the project’s executables and documentation in system directories so they will be accessible to general users (this typically requires root privileges). Initialize or update any databases or libraries that the executables require in order to function.

uninstall

Remove files installed in system directories by make install (this typically requires root privileges). This should completely and perfectly reverse a make install. The presence of an uninstall production implies a kind of humility that experienced Unix hands look for as a sign of thoughtful design; conversely, not having an uninstall production is at best careless, and (when, for example, an installation creates large database files) can be quite rude and thoughtless.

Working examples of all the standard targets are available for inspection in the fetchmail makefile. By studying all of them together you will see a pattern emerge, and (not incidentally) learn much about the fetchmail package’s structure. One of the benefits of using these standard productions is that they form an implicit roadmap of their project.

But you need not limit yourself to these utility productions. Once you master make, you’ll find yourself more and more often using the makefile machinery to automate little tasks that depend on your project file state. Your makefile is a convenient central place to put these; using it makes them readily available for inspection and avoids cluttering up your workspace with trivial little scripts.


#### 15.4.4 Generating Makefiles
One of the subtle advantages of Unix make over the dependency databases built into many IDEs is that makefiles are simple text files—files that can be generated by programs.

In the mid-1980s it was fairly common for large Unix program distributions to include elaborate custom shellscripts that would probe their environment and use the information they gathered to construct custom makefiles. These custom configurators reached absurd sizes. I wrote one once that was 3000 lines of shell, about twice as large as any single module in the program it was configuring—and this was not unusual.

The community eventually said “Enough!” and various people set out to write tools that would automate away part or all of the process of maintaining makefiles. These tools generally tried to address two issues:

One issue is portability. Makefile generators are commonly built to run on many different hardware platforms and Unix variants. They generally try to deduce things about the local system (including everything from machine word size up to which tools, languages, service libraries, and even document formatters it has available). They then try to use those deductions to write makefiles that exploit the local system’s facilities and compensate for its quirks.

The other issue is dependency derivation. It’s possible to deduce a great deal about the dependencies of a collection of C sources by analyzing the sources themselves (especially by looking at what include files they use and share). Many makefile generators do this in order to mechanically generate make dependencies.

Each different makefile generator tackles these objectives in a slightly different way. Probably a dozen or more generators have been attempted, but most proved inadequate or too difficult to drive or both, and only a few are still in live use. We’ll survey the major ones here. All are available as open-source software on the Internet.


#### 15.4.4.1 makedepend
Several small tools have tackled the rule automation part of the problem exclusively. This one, distributed along with the X windowing system from MIT, is the fastest and most useful and comes preinstalled under all modern Unixes, including all Linuxes.

makedepend takes a collection of C sources and generates dependencies for the corresponding .o files from their #include directives. These can be appended directly to a makefile, and in fact makedepend is defined to do exactly that.

makedepend is useless for anything but C projects. It doesn’t try to solve more than one piece of the makefile-generation problem. But what it does it does quite well.

makedepend is sufficiently documented by its manual page. If you type man makedepend at a terminal window you will quickly learn what you need to know about invoking it.


#### 15.4.4.2 Imake
Imake was written in an attempt to mechanize makefile generation for the X window system. It builds on makedepend to tackle both the dependency-derivation and portability problems.

Imake system effectively replaces conventional makefiles with Imakefiles. These are written in a more compact and powerful notation which is (effectively) compiled into makefiles. The compilation uses a rules file which is system-specific and includes a lot of information about the local environment.

Imake is well suited to X’s particular portability and configuration challenges and universally used in projects that are part of the X distribution. However, it has not achieved much popularity outside the X developer community. It’s hard to learn, hard to use, hard to extend, and produces generated makefiles of mind-numbing size and complexity.

The Imake tools will be available on any Unix that supports X, including Linux. There has been one heroic effort [DuBois] to make the mysteries of Imake comprehensible to non-X-programming mortals. These are worth learning if you are going to do X programming.


#### 15.4.4.3 autoconf
autoconf was written by people who had seen and rejected the Imake approach. It generates per-project configure shellscripts that are like the old-fashioned custom script configurators. These configure scripts can generate makefiles (among other things).

Autoconf is focused on portability and does no built-in dependency derivation at all. Although it is probably as complex as Imake, it is much more flexible and easier to extend. Rather than relying on a per-system database of rules, it generates configure shell code that goes out and searches your system for things.

Each configure shellscript is built from a per-project template that you have to write, called configure.in. Once generated, though, the configure script will be self-contained and can configure your project on systems that don’t carry autoconf(1) itself.

The autoconf approach to makefile generation is like imake’s in that you start by writing a makefile template for your project. But autoconf’s Makefile.in files are basically just makefiles with placeholders in them for simple text substitution; there’s no second notation to learn. If you want dependency derivation, you must take explicit steps to call makedepend(1) or some similar tool—or use automake(1).

autoconf is documented by an on-line manual in the GNU info format. The source scripts of autoconf are available from the FSF archive site, but are also preinstalled on many Unix and Linux versions. You should be able to browse this manual through your Emacs’s help system.

Despite its lack of direct support for dependency derivation, and despite its generally ad-hoc approach, in mid-2003 autoconf is clearly the most popular of the makefile generators, and has been for some years. It has eclipsed Imake and driven at least one major competitor (metaconfig) out of use.

A reference, GNU Autoconf, Automake and Libtool is available [Vaughan]. We’ll have more to say about autoconf, from a slightly different angle, in Chapter 17.


#### 15.4.4.4 automake
automake is an attempt to add Imake-like dependency derivation as a layer on top of autoconf(1). You write Makefile.am templates in a broadly Imake-like notation; automake(1) compiles them to Makefile.in files, which autoconf’s configure scripts then operate on.

automake is still relatively new technology in mid-2003. It is used in several FSF projects but has not yet been widely adopted elsewhere. While its general approach looks promising, it is as yet rather brittle—it works when used in stereotyped ways but tends to break badly if you try to do anything unusual with it.

Complete on-line documentation is shipped with automake, which can be downloaded from the FSF archive site.


### 15.5 Version-Control Systems
Code evolves. As a project moves from first-cut prototype to deliverable, it goes through multiple cycles in which you explore new ground, debug, and then stabilize what you’ve accomplished. And this evolution doesn’t stop when you first deliver for production. Most projects will need to be maintained and enhanced past the 1.0 stage, and will be released multiple times. Tracking all that detail is just the sort of thing computers are good at and humans are not.


#### 15.5.1 Why Version Control?
Code evolution raises several practical problems that can be major sources of friction and drudgery—thus a serious drain on productivity. Every moment spent on these problems is a moment not spent on getting the design and function of your project right.

Perhaps the most important problem is reversion. If you make a change, and discover it’s not viable, how can you revert to a code version that is known good? If reversion is difficult or unreliable, it’s hard to risk making changes at all (you could trash the whole project, or make many hours of painful work for yourself).

Almost as important is change tracking. You know your code has changed; do you know why? It’s easy to forget the reasons for changes and step on them later. If you have collaborators on a project, how do you know what they have changed while you weren’t looking, and who was responsible for each change?

Amazingly often, it is useful to ask what you have changed since the last known-good version, even if you have no collaborators. This often uncovers unwanted changes, such as forgotten debugging code. I now do this routinely before checking in a set of changes.

—Henry Spencer

Another issue is bug tracking. It’s quite common to get new bug reports for a particular version after the code has mutated away from it considerably. Sometimes you can recognize immediately that the bug has already been stomped, but often you can’t. Suppose it doesn’t reproduce under the new version. How do you get back the state of the code for the old version in order to reproduce and understand it?

To address these problems, you need procedures for keeping a history of your project, and annotating it with comments that explain the history. If your project has more than one developer, you also need mechanisms for making sure developers don’t overwrite each others’ versions.


#### 15.5.2 Version Control by Hand
The most primitive (but still very common) method is all hand-hacking. You snapshot the project periodically by manually copying everything in it to a backup. You include history comments in source files. You make verbal or email arrangements with other developers to keep their hands off certain files while you hack them.

The hidden costs of this hand-hacking method are high, especially when (as frequently happens) it breaks down. The procedures take time and concentration; they’re prone to error, and tend to get slipped under pressure or when the project is in trouble—that is, exactly when they are most needed.

As with most hand-hacking, this method does not scale well. It restricts the granularity of change tracking, and tends to lose metadata details such as the order of changes, who did them, and why. Reverting just a part of a large change can be tedious and time consuming, and often developers are forced to back up farther than they’d like after trying something that doesn’t work.


#### 15.5.3 Automated Version Control
To avoid these problems, you can use a version-control system (VCS), a suite of programs that automates away most of the drudgery involved in keeping an annotated history of your project and avoiding modification conflicts.

Most VCSs share the same basic logic. To use one, you start by registering a collection of source files—that is, telling your VCS to start archive files describing their change histories. Thereafter, when you want to edit one of these files, you have to check out the file—assert an exclusive lock on it. When you’re done, you check in the file, adding your changes to the archive, releasing the lock, and entering a change comment explaining what you did.

The history of the project is not necessarily linear. All VCSs in common use actually allow you to maintain a tree of variant versions (for ports to different machines, say) with tools for merging branches back into the main “trunk” version. This feature becomes important as the size and dispersion of the development group increases. It needs to be used with care, however; multiple active variants of the code base can be very confusing (just associated bug reports to the right version are not necessarily easy), and automated merging of branches does not guaranteed that the combined code works.

Most of the rest of what a VCS does is convenience: labeling, and reporting features surrounding these basic operations, and tools which allow you to view differences between versions, or to group a given set of versions of files as a named release that can be examined or reverted to at any time without losing later changes.

VCSs have their problems. The biggest one is that using a VCS involves extra steps every time you want to edit a file, steps that developers in a hurry tend to want to skip if they have to be done by hand. Near the end of this chapter we’ll discuss a way to solve this problem.

Another problem is that some kinds of natural operations tend to confuse VCSs. Renaming files is a notorious trouble spot; it’s not easy to automatically ensure that a file’s version history will be carried along with it when it is renamed. Renaming problems are particularly difficult to resolve when the VCS supports branching.

Despite these difficulties, VCSs are a huge boon to productivity and code quality in many ways, even for small single-developer projects. They automate away many procedures that are just tedious work. They help a lot in recovering from mistakes. Perhaps most importantly, they free programmers to experiment by guaranteeing that reversion to a known-good state will always be easy.

(VCSs, by the way, are not merely good for program code; the manuscript of this book was maintained as a collection of files under RCS while it was being written.)


#### 15.5.4 Unix Tools for Version Control
Historically, three VCSs have been of major significance in the Unix world, and we’ll survey them here. For an extended introduction and tutorial, consult Applying RCS and SCCS [Bolinger-Bronson].


#### 15.5.4.1 Source Code Control System (SCCS)
The first was SCCS, the original Source Code Control System developed by Bell Labs around 1980 and featured in System III Unix. SCCS seems to have been the first serious attempt at a unified source-code management system; concepts that it pioneered are still found at some level in all later ones, including commercial Unix and Windows products such as ClearCase.

SCCS itself is, however, now obsolete; it was proprietary Bell Labs software. Superior open-source alternatives have since been developed, and most of the Unix world has converted to those. SCCS is still in use to manage old projects at some commercial vendors, but can no longer be recommended for new projects.

No complete open-source implementation of SCCS exists. A clone called CSSC (Compatibly Stupid Source Control) is in development under the sponsorship of the FSF.


#### 15.5.4.2 Revision Control System (RCS)
The superior open-source alternatives began with RCS (Revision Control System), born at Purdue University a few years after SCCS and originally distributed with 4.3BSD Unix. It is logically similar to SCCS but has a cleaner command interface, and good facilities for grouping together entire project releases under symbolic names.

RCS is currently the most widely used version control system in the Unix world. Some other Unix version-control systems use it as a back end or underlayer. It is well suited for single-developer or small-group projects hosted at a single development shop.

The RCS sources are maintained and distributed by the FSF. Free ports are available for Microsoft operating systems and VAX VMS.


#### 15.5.4.3 Concurrent Version System (CVS)
CVS (Concurrent Version System) began life as a front end to RCS developed in the early 1990s, but the model of version control it uses was different enough that it immediately qualified as a new design. Modern implementations don’t rely on RCS.

Unlike RCS and SCCS, CVS doesn’t exclusively lock files when they’re checked out. Instead, it tries to reconcile nonconflicting changes mechanically when they’re checked back in, and requests human help on conflicts. The design works because patch conflicts are much less common than one might intuitively think.

The interface of CVS is significantly more complex than that of RCS, and it needs a lot more disk space. These properties make it a poor choice for small projects. On the other hand, CVS is well suited to large multideveloper efforts distributed across several development sites connected by the Internet. CVS tools on a client machine can easily be told to direct their operations to a repository located on a different host.

The open-source community makes heavy use of CVS for projects such as GNOME and Mozilla. Typically, such CVS repositories allow anyone to check out sources remotely. Anyone can, therefore, make a local copy of a project, modify it, and mail change patches to the project maintainers. Actual write access to the repository is more limited and has to be explicitly granted by the project maintainers. A developer who has such access can perform a commit option from his modified local copy, which will cause the local changes to get made directly to the remote repository.

You can see an example of a well-run CVS repository, accessible over the Internet, at the GNOME CVS site <http://cvs.gnome.org>. This site illustrates the use of CVS-aware browsing tools such as Bonsai, which are useful in helping a large and decentralized group of developers coordinate their work.

The social machinery and philosophy accompanying the use of CVS is as important as the details of the tools. The assumption is that projects will be open and decentralized, with code subject to peer review and inspection even by developers who are not officially members of the project group.

Just as importantly, CVS’s nonlocking philosophy means that projects can’t be blocked by a lock if a programmer disappears in the middle of making some changes. CVS thus allows developers to avoid the “single person point of failure” problem; in turn, this means that project boundaries can be fluid, casual contributions are relatively easy, and projects are not required to have an elaborate hierarchy of control.

The CVS sources are maintained and distributed by the FSF.

CVS has significant problems. Some are merely implementation bugs, but one basic problem is that your project’s file namespace is not versioned in the same way changes to files themselves are. Thus, CVS is easily confused by file renamings, deletions, and additions. Also, CVS records changes on a per-file basis, rather than as sets of changes made to files. This makes it harder to back out to specific versions, and harder to handle partial check-ins. Fortunately, none of these problems are intrinsic to the nonlocking style, and they have been successfully addressed by newer version-control systems.


#### 15.5.4.4 Other Version-Control Systems
CVS’s design problems are sufficient to have created demand for a better open-source VCS. Several such efforts are under way as of 2003. The most notable of these are Aegis and Subversion.

Aegis <http://www.pcug.org.au/~millerp/aegis/aegis.html> has the longest history of any of these alternatives, has hosted its own development since 1991, and is a mature production system. It features a heavy emphasis on regression-testing and validation.

Subversion <http://subversion.tigris.org/> is positioned as “CVS done right”, with the known design problems fully addressed, and in 2003 probably has the best near-term prospect of replacing CVS.

The BitKeeper <http://www.bitkeeper.com> project explores some interesting design ideas related to change-sets and multiple distributed code repositories. Linus Torvalds uses Bitkeeper for the Linux kernel sources. Its non-open-source license is, however, controversial, and has significantly retarded the acceptance of the product.


### 15.6 Runtime Debugging
Anyone who has been programming longer than a week knows that getting the syntax of your programming language right is the easy part of debugging. The hard part comes after that, when you need to understand why your syntactically correct program doesn’t behave as you expect.

The Unix tradition encourages developers to anticipate this problem by designing for transparency—in particular, designing programs in such a way that their internal data flows are readily monitored with the naked eye and simple tools, and readily mentally modeled. This is a topic we covered in detail in Chapter 6. Design for transparency is valuable both for preventing bugs and for easing the runtime-debugging task.

Design for transparency is not, however, sufficient in itself. When you are debugging a program at runtime, it’s extremely useful to be able to examine the state of your program at runtime, set breakpoints, and execute pieces of it down to the single-statement level in a controlled way. Unix has a long tradition of hosting programs to help you with this. Open-source Unixes feature a powerful one called gdb (yet another FSF project) that supports C and C++ debugging.

Perl, Python, Java, and Emacs Lisp all support standard packages or programs (included with their base distributions) that allow you to set breakpoints, control execution, and do general runtime-debugger things. Tcl, designed as a small language for small projects, has no such facility (though it does have a trace facility that can be used to watch variables at runtime).

Remember the Unix philosophy. Spend your time on design quality, not the low-level details, and automate away everything you can—including the detail work of runtime debugging.


### 15.7 Profiling
As a general rule, 90% of the execution time of your program will be spent in 10% of its code. Profilers are tools that help you identify the 10% of hot spots that constrain the speed of your program. This is a good thing for making it faster.

But in the Unix tradition, profilers have a far more important function. They enable you not to optimize the other 90%! This is good, and not just because it saves you work. The really valuable effect is that not optimizing that 90% holds down global complexity and reduces bugs.

You may recall that we quoted Donald Knuth observing “Premature optimization is the root of all evil” in Chapter 1, and that Rob Pike and Ken Thompson had a few pungent observations on the topic as well. These were the voices of experience. Do good design. Think about what’s right first. Tune for efficiency later.

Profilers help you do this. If you get in the good habit of using them, you can get rid of the bad habit of premature optimization. Profilers don’t just change the way you work; they change how you think.

Profilers for compiled languages rely on instrumenting object code, so they are even more platform-dependent than compilers. On the other hand, a compiled-language profiler doesn’t care about the source language of the programs it instruments. Under Unix, the single profiler gprof(1) handles C, C++, and all other compiled languages.

Perl, Python, and Emacs Lisp have their own profilers included in their basic distributions; these are portable across all platforms on which the host languages themselves run. Java has built-in profiling. Tcl has no profiling support as yet.


### 15.8 Combining Tools with Emacs
One of the things the Emacs editor is very good at is acting as a front end for other development tools (we discussed this from a philosophical angle in Chapter 13). In fact, nearly every tool we’ve discussed in this chapter can be driven from within an Emacs editor session through front ends that give them greater utility than they would have running standalone.

To illustrate this, we’ll walk you through the use of these tools with Emacs in a typical build/test/debug cycle. For details on them, see Emacs’s own on-line help system; this section just gives you an overview, to motivate you to learn more.

Read and learn—not just about Emacs, but about the mental habit of looking for synergies between programs, and creating them. Try to read this section as instruction in philosophy, not just technique.


#### 15.8.1 Emacs and make
Make, for example, can be started with the Emacs command ESC-x compile followed by an Enter. This command will run make(1) in the current directory, capturing the output in an Emacs buffer.

This by itself wouldn’t be very useful. But Emacs’s make mode knows about the error message format (featuring a source file and line number) emitted by Unix C compilers and many other tools.

If anything run by make issues error messages, the command Ctl-X ` (control-X-backquote) will try to parse them and take you to each error location in turn, popping open a window on the appropriate file and taking the cursor to the error line.9

9 Look at p+processes->compile under the Emacs help menu for more information on these and related compilation-control commands.

This makes it extremely easy to step through an entire build, fixing any syntax that has been broken since the last compile.


#### 15.8.2 Emacs and Runtime Debugging
For catching runtime errors, Emacs offers similar integration with your symbolic debugger—that is, you can use an Emacs mode to set breakpoints in your programs and examine their runtime state. You run the debugger by sending it commands through an Emacs window. Whenever the debugger stops on a breakpoint, the message the debugger ships back about the source location is parsed and used to pop up a window on the source around the breakpoint.

Emacs’s Grand Unified Debugger mode supports all the major C debuggers: gdb(1), sdb(1), dbx(1), and xdb(1). It also supports Perl symbolic debugging using the perldb module, and the standard debuggers for both Java and Python. Facilities built into Emacs Lisp itself support interactive debugging of Emacs Lisp code.

At time of writing (mid-2003) there is not yet support for Tcl debugging from within Emacs. The design of Tcl is such that it seems unlikely to be added.


#### 15.8.3 Emacs and Version Control
Once you’ve corrected your program’s syntax and fixed its runtime bugs, you may want to save the changes into a version-controlled archive. If you’ve only tried running version-control tools from the shell, it’s hard to blame you for sloughing off this important step. Who wants to have to remember to run checkout/checkin commands around every edit operation?

Fortunately, Emacs offers help here too. Code built into Emacs implements a simple-to-use front end for SCCS, RCS, CVS, or Subversion. The single command Ctl-x v v tries to deduce the next logical version-control operation to do on the file you are visiting. The operations this includes are registering a file, checking out and locking it, and checking it back in (accepting a change comment in a pop-up buffer).10

10 See the subsection of the Emacs on-line documentation titled Version Control for more details on these and related commands.

Emacs also helps you view the change history of version-controlled files, and helps you back out changes you don’t want. It makes it easy to apply version-control operations to whole sets or project directory trees of files. In general, it does a pretty good job of making version-control operations painless.

The implications of these features are larger than you might guess before you’ve gotten used to it. You’ll find, once you get used to fast and easy version control, that it’s extremely liberating. Because you know you can always revert to a known-good state, you’ll find you feel more free to develop in a fluid and exploratory way, trying lots of changes out to see their effects.


#### 15.8.4 Emacs and Profiling
Surprise...this is perhaps the only phase of the development cycle in which Emacs front-ending does not offer substantial help. Profiling is an intrinsically batchy operation—instrument your program, run it, view the statistics, speed-tune the code with an editor, repeat. There isn’t much room for Emacs leverage in the profiling-specific parts of this cycle.

Nevertheless, there’s a good tutorial reason for us to think about Emacs and profiling. If you found yourself analyzing a lot of profiling reports, it might pay you to write a mode in which a mouse click or keystroke on a profile report line visited the source of the relevant function. This actually would be fairly easy to do using the Emacs ’tags’ code. In fact, by the time you read this, some other reader may already have written such a mode and contributed it to the public Emacs code base.

The real point here is again a philosophical one. Don’t drudge—drudging wastes your time and productivity! If you find yourself spending a lot of time on the low-level mechanical parts of development, step back. Apply the Unix philosophy. Use your toolkit to automate or semi-automate the task.

Then give back something in return for all you’ve inherited, by posting your solution as open-source software to the Internet. Help liberate your fellow programmers from drudgery, too.


#### 15.8.5 Like an IDE, Only Better
Earlier in this chapter we asserted that Emacs can give you capabilities resembling those of a conventional integrated development environment, only better. By now you should have enough facts in hand to see how that can be true. You can run entire development projects from inside Emacs, driving the low-level mechanics with a few keystrokes and saving yourself the mental effort and disruption of constantly switching contexts.

The Emacs-enabled development style trades away some capabilities of advanced IDEs, like graphical views of program structure. But those are frills. What Emacs gives you in return is flexibility and control. You’re not limited by the imagination of the IDE designer: you can tweak, customize, and add task-related intelligence using Emacs Lisp. Also, Emacs is better at supporting mixed-language development than conventional IDEs.

Finally, you’re not limited to accepting what one small group of IDE developers sees fit to support. By keeping an eye on the open-source community, you can benefit from the work of thousands of your peers, Emacs-using developers facing challenges much like yours. This is much more effective—and much more fun.

## 16. Reuse: On Not Reinventing the Wheel

When the superior man refrains from acting, his force is felt for a thousand miles.

—Tao Te Ching (as popularly mistranslated)

Reluctance to do unnecessary work is a great virtue in programmers. If the Chinese sage Lao-Tze were alive today and still teaching the way of the Tao, he would probably be mistranslated as: When the superior programmer refrains from coding, his force is felt for a thousand miles. In fact, recent translators have suggested that the Chinese term wu-wei that has traditionally been rendered as “inaction” or “refraining from action” should probably be read as “least action” or “most efficient action” or “action in accordance with natural law”, which is an even better description of good engineering practice!

Remember the Rule of Economy. Re-inventing fire and the wheel for every new project is terribly wasteful. Thinking time is precious and very valuable relative to all the other inputs that go into software development; accordingly, it should be spent solving new problems rather than rehashing old ones for which known solutions already exist. This attitude gives the best return both in the “soft” terms of developing human capital and in the “hard” terms of economic return on development investment.

Reinventing the wheel is bad not only because it wastes time, but because reinvented wheels are often square. There is an almost irresistible temptation to economize on reinvention time by taking a shortcut to a crude and poorly-thought-out version, which in the long run often turns out to be false economy.

—Henry Spencer

The most effective way to avoid reinventing the wheel is to borrow someone else’s design and implementation of it. In other words, to reuse code.

Unix supports reuse at every level from individual library modules up to entire programs, which Unix helps you script and recombine. Systematic reuse is one of the most important distinguishing behaviors of Unix programmers, and the experience of using Unix should teach you a habit of trying to prototype solutions by combining existing components with a minimum of new invention, rather than rushing to write standalone code that will only be used once.

The virtuousness of code reuse is one of the great apple-pie-and-motherhood verities of software development. But many developers entering the Unix community from a basis of experience in other operating systems have never learned (or have unlearned) the habit of systematic reuse. Waste and duplicative work is rife, even though it seems to be against the interests both of those who pay for code and those who produce it. Understanding why such dysfunctional behavior persists is the first step toward changing it.


### 16.1 The Tale of J. Random Newbie
Why do programmers reinvent wheels? There are many reasons, reaching all the way from the narrowly technical to the psychology of programmers and the economics of the software production system. The damage from the endemic waste of programming time reaches all these levels as well.

Consider the first, formative job experience of J. Random Newbie, a programmer fresh out of college. Let us assume that he (or she) has been taught the value of code reuse and is brimming with youthful zeal to apply it.

Newbie’s first project puts him on a team building some large application. Let’s say for the sake of example that it’s a GUI intended to help end users intelligently construct queries for and navigate through a large database. The project managers have assembled what they deem to be a suitable collection of tools and components, including not merely a development language but many libraries as well.

The libraries are crucial to the project. They package many services—from windowing widgets and network connections on up to entire subsystems like interactive help—that would otherwise require immense quantities of additional coding, with a severe impact on the project’s budget and its ship date.

Newbie is a little worried about that ship date. He may lack experience, but he’s read Dilbert and heard a few war stories from experienced programmers. He knows management has a tendency to what one might euphemistically call “aggressive” schedules. Perhaps he has read Ed Yourdon’s Death March [Yourdon], which as long ago as 1996 noted that a majority of projects are on a time and resource budget at least 50% too tight, and that the trend is for that squeeze to get worse.

But Newbie is bright and energetic. He figures his best chance of succeeding is to learn to use the tools and libraries that have been handed to him as intelligently as possible. He limbers up his typing fingers, hurls himself at the challenge...and enters hell.

Everything takes longer and is more painful than he expects. Beneath the surface gloss of their demo applications, the components he is re-using seem to have edge cases in which they behave unpredictably or destructively—edge cases his code tickles daily. He often finds himself wondering what the library programmers were thinking. He can’t tell, because the components are inadequately documented—often by technical writers who aren’t programmers and don’t think like programmers. And he can’t read the source code to learn what it is actually doing, because the libraries are opaque blocks of object code under proprietary licenses.

Newbie has to code increasingly elaborate workarounds for component problems, to the point where the net gain from using the libraries starts to look marginal. The workarounds make his code progressively grubbier. He probably hits a few places where a library simply cannot be made to do something crucially important that is theoretically within its specifications. Sometimes he is sure there is some way to actually make the black box perform, but he can’t figure out what it is.

Newbie finds that as he puts more strain on the libraries, his debugging time rises exponentially. His code is bedeviled with crashes and memory leaks that have trace paths leading into the libraries, into code he can’t see or modify. He knows most of those trace paths probably lead back out to his code, but without source it is very difficult to trace through the bits he didn’t write.

Newbie is growing horribly frustrated. He had heard in college that in industry, a hundred lines of finished code a week is considered good performance. He had laughed then, because he was many times more productive than that on his class projects and the code he wrote for fun. Now it’s not funny any more. He is wrestling not merely with his own inexperience but with a cascade of problems created by the carelessness or incompetence of others—problems he can’t fix, but can only work around.

The project schedule is slipping. Newbie, who dreamed of being an architect, finds himself a bricklayer trying to build with bricks that won’t stack properly and that crumble under load-bearing pressure. But his managers don’t want to hear excuses from a novice programmer; complaining too loudly about the poor quality of the components is likely to get him in political trouble with the senior people and managers who selected them. And even if he could win that battle, changing components would be a complicated proposition involving batteries of lawyers peering narrowly at licensing terms.

Unless Newbie is very, very lucky, he is not going to be able to get library bugs fixed within the lifetime of his project. In his saner moments, he may realize that the working code in the libraries doesn’t draw his attention the way the bugs and omissions do. He’d love to sit down for a clarifying chat with the component developers; he suspects they can’t be the idiots their code sometimes suggests, just programmers like him working within a system that frustrates their attempts to do the right thing. But he can’t even find out who they are—and if he could, the software vendor they work for probably wouldn’t let them talk to him.

In desperation, Newbie starts making his own bricks—simulating less stable library services with more stable ones and writing his own implementations from scratch. His replacement code, because he has a complete mental model of it that he can refresh by rereading, tends to work relatively well and be easier to debug than the combination of opaque components and workarounds it replaces.

Newbie is learning a lesson; the less he relies on other peoples’ code, the more lines of code he can get written. This lesson feeds his ego. Like all young programmers, deep down he thinks he is smarter than anyone else. His experience seems, superficially, to be confirming this. He begins building his own personal toolkit, one better fitted to his hand.

Unfortunately, the roll-your-own reflexes Newbie is acquiring are a short-term local optimization that will cause long-term problems. He may get more lines of code written, but the actual value of what he produces is likely to drop substantially relative to what it would have been if he were doing successful reuse. More code does not equal better code, not when it’s written at a lower level and largely devoted to reinventing wheels.

Newbie has at least one more demoralizing experience in store, when he changes jobs. He is likely to discover that he can’t take his toolkit with him. If he walks out of the building with code he wrote on company time, his old employers could well regard this as intellectual-property theft. His new employers, knowing this, are not likely to react well if he admits to reusing any of his old code.

Newbie could well find his toolkit is useless even if he can sneak it into the building at his new job. His new employers may use a different set of proprietary tools, languages, and libraries. It is likely he will have to learn a somewhat new set of techniques and reinvent a new set of wheels each time he changes projects.

Thus do programmers have reuse (and other good practices that go with it, like modularity and transparency) systematically conditioned out of them by a combination of technical problems, intellectual-property barriers, politics, and personal ego needs. Multiply J. Random Newbie by a hundred thousand, age him by decades, and have him grow more cynical and more used to the system year by year. There you have the state of much of the software industry, a recipe for enormous waste of time and capital and human skill—even before you factor in vendors’ market-control tactics, incompetent management, impossible deadlines, and all the other pressures that make doing good work difficult.

The professional culture that springs from J. Random Newbie’s experiences will reflect them in the large. Programming shops will have a ferocious Not Invented Here complex. They will be poisonously ambivalent about code reuse, pushing inadequate but heavily marketed vendor components on their programmers in order to meet schedule crunches, while simultaneously rejecting reuse of the programmers’ own tested code. They will churn out huge volumes of ad-hoc, duplicative software produced by programmers who know the results will be garbage but are glumly resigned to never being able to fix anything but their own individual pieces.

The closest equivalent of code reuse to emerge in such a culture will be a dogma that code once paid for can never be thrown away, but must instead be patched and kluged even when all parties know that it would be better to scrap and start anew. The products of this culture will become progressively more bloated and buggy over time even when every individual involved is trying his or her hardest to do good work.


### 16.2 Transparency as the Key to Reuse
We field-tested the tale of J. Random Newbie on a number of experienced programmers. If you the reader are one yourself, we expect you responded to it much as they did: with groans of recognition. If you are not a programmer but you manage programmers, we sincerely hope you found it enlightening. The tale is intended to illustrate the ways in which different levels of pressure against reuse reinforce each other to create a magnitude of problem not linearly predictable from any individual cause.

So accustomed are most of us to the background assumptions of the software industry that it can take considerable mental effort before the primary causes of this problem can be separated from the accidents of narrative. But they are not, in the end, very complex.

At the bottom of most of J. Random Newbie’s troubles (and the large-scale quality problems they imply) is transparency — or, rather, the lack of it. You can’t fix what you can’t see inside. In fact, for any software with a nontrivial API, you can’t even properly use what you can’t see inside. Documentation is inadequate not merely in practice but in principle; it cannot convey all the nuances that the code embodies.

In Chapter 6, we observed how central transparency is to good software. Object-code-only components destroy the transparency of a software system, On the other hand, the frustrations of code reuse are far less likely to bite when the code you are attempting to reuse is available for reading and modification. Well-commented source code is its own documentation. Bugs in source code can be fixed. Source can be instrumented and compiled for debugging to make probing its behavior in obscure cases easier. And if you need to change its behavior, you can do that.

There is another vital reason to demand source code. A lesson Unix programmers have learned through decades of constant change is that source code lasts, object code doesn’t. Hardware platforms change, service components like support libraries change, the operating system grows new APIs and deprecates old ones. Everything changes—but opaque binary executables cannot adapt to change. They are brittle, cannot be reliably forward-ported, and have to be supported with increasingly thick and error-prone layers of emulation code. They lock users into the assumptions of the people who built them. You need source because, even if you have neither the intention nor the need to change the software, you will have to rebuild it in new environments to keep it running.

The importance of transparency and the code-legacy problem are reasons that you should require the code you reuse to be open to inspection and modification.1 It is not a complete argument for what is now called ’open source’; because ’open source’ has rather stronger implications than simply requiring code to be transparent and visible.

1 NASA, which consciously builds software intended to have a service life of decades, has learned to insist on source-code availability for all space avionics software.


### 16.3 From Reuse to Open Source
In the early days of Unix, components of the operating system, its libraries, and its associated utilities were passed around as source code; this openness was a vital part of the Unix culture. We described in Chapter 2 how, when this tradition was disrupted after 1984, Unix lost its initial momentum. We have also described how, a decade later, the rise of the GNU toolkit and Linux prompted a rediscovery of the value of open-source code.

Today, open-source code is again one of the most powerful tools in any Unix programmer’s kit. Accordingly, though the explicit concept of “open source” and the most widely used open-source licenses are decades younger than Unix itself, it’s important to understand both to do leading-edge development in today’s Unix culture.

Open source relates to code reuse in much the way romantic love relates to sexual reproduction—it’s possible to explain the former in terms of the latter, but to do so is to risk overlooking much of what makes the former interesting. Open source does not reduce to merely being a tactic for supporting reuse in software development. It is an emergent phenomenon, a social contract among developers and users that tries to secure several advantages related to transparency. As such, there are several different ways to approaching an understanding of it.

Our historical description earlier in this book chose one angle by focusing on causal and cultural relationships between Unix and open source. We’ll discuss the institutions and tactics of open-source development in Chapter 19. In discussing the theory and practice of code reuse, it’s useful to think of open source more specifically, as a direct response to the problems we dramatized in the tale of J. Random Newbie.

Software developers want the code they use to be transparent. Furthermore, they don’t want to lose their toolkits and their expertise when they change jobs. They get tired of being victims, fed up with being frustrated by blunt tools and intellectual-property fences and having to repeatedly re-invent the wheel.

These are the motives for open source that flow from J. Random Newbie’s painful initiatory experience with reuse. Ego needs play a part here, too; they give pervasive emotional force to what would otherwise be a bloodless argument about engineering best practices. Software developers are like every other kind of craftsman and artificer; they want, not so secretly, to be artists. They have the drives and needs of artists, including the desire to have an audience. They not only want to reuse code, they want their code to be reused. There is an imperative here that goes beyond and overrides short-term economic goal-seeking and that cannot be satisfied by closed-source software production.

Open source is a kind of ideological preemptive strike on all these problems. If the root of most of J. Random Newbie’s problems with reuse is the opacity of closed-source code, then the institutional assumptions that produce closed-source code must be smashed. If corporate territoriality is a problem, it must be attacked or bypassed until the corporations have caught on to how self-destructive their territorial reflexes are. Open source is what happens when code reuse gets a flag and an army.

Accordingly, since the late 1990s, it no longer makes any sense to try to recommend strategies and tactics for code reuse without talking about open source, open-source practices, open-source licensing, and the open-source community. Even if those issues could be separated elsewhere, they have become inextricably bound together in the Unix world.

In the remainder of this chapter, we’ll survey various issues associated with reusing open-source code: evaluation, documentation, and licensing. In Chapter 19 we’ll discuss the open-source development model more generally, and examine the conventions you should follow when you are releasing code for others to use.


### 16.4 The Best Things in Life Are Open
On the Internet, literally terabytes of Unix sources for systems and applications software, service libraries, GUI toolkits and hardware drivers are available for the taking. You can have most built and running in minutes with standard tools. The mantra is ./configure; make; make install; usually you have to be root to do the install part.

People from outside the Unix world (especially non-technical people) are prone to think open-source (or ’free’) software is necessarily inferior to the commercial kind, that it’s shoddily made and unreliable and will cause more headaches than it saves. They miss an important point: in general, open-source software is written by people who care about it, need it, use it themselves, and are putting their individual reputations among their peers on the line by publishing it. They also tend to have less of their time consumed by meetings, retroactive design changes, and bureaucratic overhead. They are therefore both more strongly motivated and better positioned to do excellent work than wage slaves toiling Dilbert-like to meet impossible deadlines in the cubicles of proprietary software houses.

Furthermore, the open-source user community (those peers) is not shy about nailing bugs, and its standards are high. Authors who put out substandard work experience a lot of social pressure to fix their code or withdraw it, and can get a lot of skilled help fixing it if they choose. As a result, mature open-source packages are generally of high quality and often functionally superior to any proprietary equivalent. They may lack polish and have documentation that assumes much, but the vital parts will usually work quite well.

Besides the peer-review effect, another reason to expect better quality is this: in the open-source world developers are never forced by a deadline to close their eyes, hold their noses, and ship. A major consequent difference between open-source practice and elsewhere is that a release level of 1.0 actually means the software is ready to use. In fact, a version number of 0.90 or above is a fairly reliable signal that the code is production-ready, but the developers are not quite ready to bet their reputations on it.

If you are a programmer from outside the Unix world, you may find this claim difficult to believe. If so, consider this: on modern Unixes, the C compiler itself is almost invariably open source. The Free Software Foundation’s GNU Compiler Collection (GCC) is so powerful, so well documented, and so reliable that there is effectively no proprietary Unix compiler market left, and it has become normal for Unix vendors to port GCC to their platforms rather than do in-house compiler development.

The way to evaluate an open-source package is to read its documentation and skim some of its code. If what you see appears to be competently written and documented with care, be encouraged. If there also is evidence that the package has been around for a while and has incorporated substantial user feedback, you may bet that it is quite reliable (but test anyway).

A good gauge of maturity and the volume of user feedback is the number of people besides the original author mentioned in the README and project news or history files in the source distribution. Credits to lots of people for sending in fixes and patches are signs both of a significant user base keeping the authors on their toes, and of a conscientious maintainer who is responsive to feedback and will take corrections. It is also an indication that, if early code tends to be a minefield of bugs, there has since been a thundering herd run through it without too many recent explosions.

It’s also a good omen when the software has its own Web page, on-line FAQ (Frequently Asked Questions) list, and an associated mailing list or Usenet newsgroup. These are all signs that a live and substantial community of interest has grown up around the software. On Web pages, recent updates and an extensive mirror list are reliable signs of a project with a vigorous user community. Packages that are duds just don’t get this kind of continuing investment, because they can’t reward it.

Ports to multiple platforms are also a valuable indication of a diversified user base. Project pages tend to advertise new ports precisely because they signal credibility.

Here are some examples of what Web pages associated with high-quality open-source software look like:

• GIMP <http://www.gimp.org/>

• GNOME <http://www.gnome.org>

• KDE <http://www.kde.org>

• Python <http://www.python.org>

• The Linux kernel <http://www.kernel.org>

• PostgreSQL <http://www.postgresql.org>

• XFree86 <http://xfree86.org>

• InfoZip <http://www.info-zip.org/pub/infozip/>

Looking at Linux distributions is another good way to find quality. Distribution-makers for Linux and other open-source Unixes carry a lot of specialist expertise about which projects are best-of-breed—that’s a large part of the value they add when they integrate a release. If you are already using an open-source Unix, something else to check is whether the package you are evaluating is already carried by your distribution.


### 16.5 Where to Look?
Because so much open source is available in the Unix world, skill at finding code to reuse can have an enormous payoff—much greater than is the case for other operating systems. Such code comes in many forms: individual code snippets and examples, code libraries, utilities to be reused in scripts. Under Unix most code reuse is not a matter of actual cut-and-paste into your program—in fact, if you find yourself doing that, there is almost certainly a more graceful mode of reuse that you are missing. Accordingly, one of the most useful skills to cultivate under Unix is a good grasp of all the different ways to glue together code, so you can use the Rule of Composition.

To find re-usable code, start by looking under your nose. Unixes have always featured a rich toolkit of re-usable utilities and libraries; modern ones, such as any current Linux system, include thousands of programs, scripts, and libraries that may be re-usable. A simple man -k search with a few keywords often yields useful results.

To begin to grasp something of the amazing wealth of resources out there, surf to SourceForge, ibiblio, and Freshmeat.net. Other sites as important as these three may exist by the time you read this book, but all three of these have shown continuing value and popularity over a period of years, and seem likely to endure.

SourceForge <http://www.sourceforge.net> is a demonstration site for software specifically designed to support collaborative development, complete with associated project-management services. It is not merely an archive but a free development-hosting service, and in mid-2003 is undoubtedly the largest single hub of open-source activity in the world.

The Linux archives at ibiblio <http://www.ibiblio.org> were the largest in the world before SourceForge. The ibiblio archives are passive, simply a place to publish packages. They do, however, have a better interface to the World Wide Web than most passive sites (the program that creates its Web look and feel was one of our case studies in the discussion of Perl in Chapter 14). It’s also the home site of the Linux Documentation Project, which maintains many documents that are excellent resources for Unix users and developers.

Freshmeat <http://www.freshmeat.net> is a system dedicated to providing release announcements of new software, and new releases of old software. It lets users and third parties attach reviews to releases.

These three general-purpose sites contain code in many languages, but most of their content is C or C++. There are also sites specialized around some of the interpreted languages as discussed in Chapter 14.

The CPAN archive is the central repository for useful free code in Perl. It is easily reached from the Perl home page <http://www.perl.com/perl>.

The Python Software Activity makes an archive of Python software and documentation available at the Python Home Page <http://www.python.org>.

Many Java applets and pointers to other sites featuring free Java software are made available at the Java Applets page <http://java.sun.com/applets/>.

One of the most valuable ways you can invest your time as a Unix developer is to spend time wandering around these sites learning what is available for you to use. The coding time you save may be your own!

Browsing the package metadata is a good idea, but don’t stop there. Sample the code, too. You’ll get a better grasp on what the code is doing, and be able to use it more effectively.

More generally, reading code is an investment in the future. You’ll learn from it—new techniques, new ways to partition problems, different styles and approaches. Both using the code and learning from it are valuable rewards. Even if you don’t use the techniques in the code you study, the improved definition of the problem you get from looking at other peoples’ solutions may well help you invent a better one of your own.

Read before you write; develop the habit of reading code. There are seldom any completely new problems, so it is almost always possible to discover code that is close enough to what you need to be a good starting point. Even when your problem is genuinely novel, it is likely to be genetically related to a problem someone else has solved before, so the solution you need to develop is likely to be related to some pre-existing one as well.


### 16.6 Issues in Using Open-Source Software
There are three major issues in using or re-using open-source software; quality, documentation, and licensing terms. We’ve seen above that if you exercise a little judgment in picking through your alternatives, you will generally find one or more of quite respectable quality.

Documentation is often a more serious issue. Many high-quality open-source packages are less useful than they technically ought to be because they are poorly documentated. Unix tradition encourages a rather hieratic style of documentation, one which (while it may technically capture all of a package’s features) assumes that the reader is intimately familiar with the application domain and reading very carefully. There are good reasons for this, which we’ll discuss in Chapter 18, but the style can present a bit of a barrier. Fortunately, extracting value from it is a learnable skill.

It is worth doing a Web search for phrases including the software package, or topic keywords, and the string “HOWTO” or “FAQ”. These queries will often turn up documentation more useful to novices than the man page.

The most serious issue in reusing open-source software (especially in any kind of commercial product) is understanding what obligations, if any, the package’s license puts upon you. In the next two sections we’ll discuss this issue in detail.


### 16.7 Licensing Issues
Anything that is not public domain has a copyright, possibly more than one. Under U.S. federal law, the authors of a work hold copyright even if there is no copyright notice.

Who counts as an author under copyright law can be complicated, especially for software that has been worked on by many hands. This is why licenses are important. They can authorize uses of code in ways that would be otherwise impermissible under copyright law and, drafted appropriately, can protect users from arbitrary actions by the copyright holders.

In the proprietary software world, the license terms are designed to protect the copyright. They’re a way of granting a few rights to users while reserving as much legal territory as possible for the owner (the copyright holder). The copyright holder is very important, and the license logic so restrictive that the exact technicalities of the license terms are usually unimportant.

As will be seen below, the copyright holder typically uses the copyright to protect the license, which makes the code freely available under terms he intends to perpetuate indefinitely. Otherwise, only a few rights are reserved and most choices pass to the user. In particular, the copyright holder cannot change the terms on a copy you already have. Therefore, in open-source software the copyright holder is almost irrelevant—but the license terms are very important.

Normally the copyright holder of a project is the current project leader or sponsoring organization. Transfer of the project to a new leader is often signaled by changing the copyright holder. However, this is not a hard and fast rule; many open-source projects have multiple copyright holders, and there is no instance on record of this leading to legal problems. Some projects choose to assign copyright to the Free Software Foundation, on the theory that it has an interest in defending open source and lawyers available to do it.


#### 16.7.1 What Qualifies as Open Source
For licensing purposes, we can distinguish several different kinds of rights that a license may convey. There are rights to copy and redistribute, rights to use, rights to modify for personal use, and rights to redistribute modified copies. A license may restrict or attach conditions to any of these rights.

The Open Source Definition <http://www.opensource.org/osd.html> is the result of a great deal of thought about what makes software “open source” or (in older terminology) “free”. It is widely accepted in the open-source community as an articulation of the social contract among open-source developers. Its constraints on licensing impose the following requirements:

• An unlimited right to copy be granted.

• An unlimited right to redistribute in unmodified form be granted.

• An unlimited right to modify for personal use be granted.

The guidelines prohibit restrictions on redistribution of modified binaries; this meets the needs of software distributors, who need to be able to ship working code without encumbrance. It allows authors to require that modified sources be redistributed as pristine sources plus patches, thus establishing the author’s intentions and an “audit trail” of any changes by others.

The OSD is the legal definition of the “OSI Certified Open Source” certification mark, and as good a definition of “free software” as anyone has ever come up with. All of the standard licenses (MIT, BSD, Artistic, GPL/LGPL, and MPL) meet it (though some, like GPL, have other restrictions which you should understand before choosing it).

Note that licenses that allow only noncommercial use do not qualify as open-source licenses, even if they are based on GPL or some other standard license. Such licenses discriminate against particular occupations, persons, and groups, a practice which the OSD’s Clause 5 explicitly forbids.

Clause 5 was written after years of painful experience. No-commercial-use licenses turn out to have the problem that there is no bright-line legal test for what sort of redistribution qualifies as ’commercial’. Selling the software as a product qualifies, certainly. But what if it were distributed at a nominal price of zero in conjunction with other software or data, and a price is charged for the whole collection? Would it make a difference whether the software were essential to the function of the whole collection?

Nobody knows. The very fact that no-commercial-use licenses create uncertainty about a redistributor’s legal exposure is a serious strike against them. One of the objectives of the OSD is to ensure that people in the distribution chain of OSD-conforming software do not need to consult with intellectual-property lawyers to know what their rights are. OSD forbids complicated restrictions against persons, groups, and occupations partly so that people dealing with collections of software will not face a combinatorial explosion of slightly differing (and perhaps conflicting) restrictions on what they can do with it.

This concern is not hypothetical, either. One important part of the open-source distribution chain is CD-ROM distributors who aggregate it in useful collections ranging from simple anthology CDs up to bootable operating systems. Restrictions that would make life prohibitively complicated for CD-ROM distributors, or others trying to spread open-source software commercially, have to be forbidden.

On the other hand, the OSD has nothing to say about the laws of your jurisdiction. Some countries have laws against exporting certain restricted technologies to named ’rogue states’. The OSD cannot negate those, it only says that licensors may not add restrictions of their own.


#### 16.7.2 Standard Open-Source Licenses
Here are the standard open-source license terms you are likely to encounter. The abbreviations listed here are in general use.

MIT <http://www.opensource.org/licenses/mit-license.html>

MIT X Consortium license (like BSD’s but with no advertising requirement)

BSD <http://www.opensource.org/licenses/bsd-license.html>

University of California at Berkeley Regents copyright (used on BSD code)

Artistic License <http://www.opensource.org/licenses/artistic-license.html>

Same terms as Perl Artistic License

GPL <http://www.gnu.org/copyleft.html>

GNU General Public License

LGPL <http://www.gnu.org/copyleft.html>

Library (or ’Lesser’) GPL

MPL <http://www.opensource.org/licenses/MPL-1.1.html>

Mozilla Public License

We’ll discuss these licenses in more detail, from a developer’s point of view, in Chapter 19. For the purposes of this chapter, the only important distinction among them is whether they are infectious or not. A license is infectious if it requires that any derivative work of the licensed software also be placed under its terms.

Under these licenses, the only kind of open-source use you should really worry about is actual incorporation of the free-software code into a proprietary product (as opposed, say, to merely using open-source development tools to make your product). If you’re prepared to include proper license acknowledgements and pointers to the source code you’re using in your product documentation, even direct incorporation should be safe provided the license is not infectious.

The GPL is both the most widely used and the most controversial infectious license. And it is clause 2(b), requiring that any derivative work of a GPLed program itself be GPLed, that causes the controversy. (Clause 3(b) requiring licensors to make source available on physical media on demand used to cause some, but the Internet explosion has made publishing source code archives as required by 3(a) so cheap that nobody worries about the source-publication requirement any more.)

Nobody is quite certain what the “contains or is derived from” in clause 2(b) means, nor what kinds of use are protected by the “mere aggregation” language a few paragraphs later. Contentious issues include library linking and inclusion of GPL-licensed header files. Part of the problem is that the U.S. copyright statutes do not define what derivation is; it has been left to the courts to hammer out definitions in case law, and computer software is an area in which this process (as of mid-2003) has barely begun.

At one end, the “mere aggregation” certainly makes it safe to ship GPLed software on the same media with your proprietary code, provided they do not link to or call each other. They may even be tools operating on the same file formats or on-disk structures; that situation, under copyright law, would not make one a derivative of the other.

At the other end, splicing GPLed code into your proprietary code, or linking GPLed object code to yours, certainly does make your code a derivative work and requires it to be GPLed.

It is generally believed that one program may execute a second program as a subprocess without either program becoming thereby a derivative work of the other.

The case that causes dispute is dynamic linking of shared libraries. The Free Software Foundation’s position is that if a program calls another program as a shared library, then that program is a derivative work of the library. Some programmers think this claim is overreaching. There are technical, legal, and political arguments on both sides that we won’t rehash here. Since the Free Software Foundation wrote and owns the license, it would be prudent to behave as if the FSF’s position is correct until a court rules otherwise.

Some people think the 2(b) language is deliberately designed to infect every part of any commercial program that uses even a snippet of GPLed code; such people refer to it as the GPV, or “General Public Virus”. Others think the “mere aggregation” language covers everything short of mixing GPL and non-GPL code in the same compilation or linkage unit.

This uncertainty has caused enough agitation in the open-source community that the FSF had to develop the special, slightly more relaxed “Library GPL” (which they have since renamed the “Lesser GPL”) to reassure people they could continue to use runtime libraries that came with the FSF’s GNU compiler collection.

You’ll have to choose your own interpretation of clause 2(b); most lawyers will not understand the technical issues involved, and there is no case law. As a matter of empirical fact, the FSF has never (from its founding in 1984 to mid-2003, at least) sued anyone under the GPL but it has enforced the GPL by threatening lawsuit, in all known cases successfully. And, as another empirical fact, Netscape includes the source and object of a GPLed program with the commercial distribution of its Netscape Navigator browser.

The MPL and LGPL are infectious in a more limited way than GPL. They explicitly allow linking with proprietary code without turning that code into a derivative work, provided all traffic between the GPLed and non-GPLed code goes through a library API or other well-defined interface.


#### 16.7.3 When You Need a Lawyer
This section is directed to commercial developers considering incorporating software that falls under one of these standard licenses into closed-source products.

Having gone through all this legal verbiage, the expected thing for us to do at this point is to utter a somber disclaimer to the effect that we are not lawyers, and that if you have any doubts about the legality of something you want to do with open-source software, you should immediately consult a lawyer.

With all due respect to the legal profession, this would be fearful nonsense. The language of these licenses is as clear as legalese gets—they were written to be clear—and should not be at all hard to understand if you read it carefully. The lawyers and courts are actually more confused than you are. The law of software rights is murky, and case law on open-source licenses is (as of mid-2003) nonexistent; no one has ever been sued under them.

This means a lawyer is unlikely to have a significantly better insight than a careful lay reader. But lawyers are professionally paranoid about anything they don’t understand. So if you ask one, he is rather likely to tell you that you shouldn’t go anywhere near open-source software, despite the fact that he probably doesn’t understand the technical aspects or the author’s intentions anywhere near as well as you do.

Finally, the people who put their work under open-source licenses are generally not mega-corporations attended by schools of lawyers looking for blood in the water; they’re individuals or volunteer groups who mainly want to give their software away. The few exceptions (that is, large companies both issuing under open-source licenses and with money to hire lawyers) have a stake in open source and don’t want to antagonize the developer community that produces it by stirring up legal trouble. Therefore, your odds of getting hauled into court on an innocent technical violation are probably lower than your chances of being struck by lightning in the next week.

This isn’t to say you should treat these licenses as jokes. That would be disrespectful of the creativity and sweat that went into the software, and you wouldn’t enjoy being the first litigation target of an enraged author no matter how the lawsuit came out. But in the absence of definitive case law, a visible good-faith effort to meet the author’s intentions is 99% of what you can do; the additional 1% of protection you might (or might not) get by consulting a lawyer is unlikely to make a difference.

