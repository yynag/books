#  Appendix

## A. Glossary of Abbreviations
The most important abbreviations and acronyms used in the main text are defined here.

API

Application Programming Interface. The set of procedure calls that communicates with a linkable procedure library or an operating-system kernel or the combination of both.

BSD

Berkeley System Distribution; also Berkeley Software Distribution; sources are ambiguous. The generic name of the Unix distributions issued by the Computer Science Research Group at the University of California at Berkeley between 1976 and 1994, and of the open-source Unixes genetically descended from them.

CLI

Command Line Interface. Considered archaic by some, but still very useful in the Unix world.

CPAN

Comprehensive Perl Archive Network. The central Web repository <http://cpan.org/> for Perl modules and extensions.

GNU

GNU’s Not Unix! The recursive acronym for the Free Software Foundation’s project to produce an entire free-software clone of Unix. This effort didn’t completely succeed, but did produce many of the essential tools of modern Unix development including Emacs and the GNU Compiler Collection.

GUI

Graphical User Interface. The modern style of application interface using mice, windows, and icons invented at Xerox PARC during the 1970s, as opposed to the older CLI or roguelike styles.

IDE

Integrated Development Environment. A GUI workbench for developing code, featuring facilities like symbolic debugging, version control, and data-structure browsing. These are not commonly used under Unix, for reasons discussed in Chapter 15.

IETF

Internet Engineering Task Force. The entity responsible for defining Internet protocols such as TCP/IP. A loose, collegial organization mainly of technical people.

IPC

Inter-Process Communication. Any method of passing data between processes running in separate address spaces.

MIME

Multipurpose Internet Mail Extensions. A series of RFCs that describe standards for embedding binary and multipart messages within RFC-822 mail. Besides being used for mail transport, MIME is used as an underlevel by important application protocols including HTTP and BEEP.

OO

Object Oriented. A style of programming that tries to encapsulate data to be manipulated and the code that manipulates it in (theoretically) sealed containers called objects. By contrast, non-object-oriented programming is more casual about exposing the internals of the data structure and code.

OS

Operating System. The foundation software of a machine; that which schedules tasks, allocates storage, and presents a default interface to the user between applications. The facilities an operating system provides and its general design philosophy exert an extremely strong influence on programming style and on the technical cultures that grow up around its host machines.

PDF

Portable Document Format. The PostScript language for control of printers and other imaging devices is designed to be streamed to printers. PDF is a sequence of PostScript pages, packaged with annotations so it can conveniently be used as a display format.

PDP-11

Programmable Data Processor 11. Possibly the single most successful minicomputer design in history; first shipped in 1970, last shipped in 1990, and the immediate ancestor of the VAX. The PDP-11 was the first major Unix platform.

PNG

Portable Network Graphics. The World Wide Web Consortium’s standard and recommended format for bitmap graphics images. An elegantly designed binary graphics format described in Chapter 5.

RFC

Request For Comment. An Internet standard. The name arose at a time when the documents were regarded as proposals to be submitted to a then-nonexistent but anticipated formal approval process of some sort. The formal approval process never materialized.

RPC

Remote Procedure Call. Use of IPC methods that attempt to create the illusion that the processes exchanging them are running in the same address space, so they can cheaply (a) share complex structures, and (b) call each other like function libraries, ignoring latency and other performance considerations. This illusion is notoriously difficult to sustain.

TCP/IP

Transmission Control Protocol/Internet Protocol. The basic protocol of the Internet since the conversion from NCP (Network Control Protocol) in 1983. Provides reliable transport of data streams.

UDP/IP

Universal Datagram Protocol/Internet Protocol. Provides unreliable but low-latency transport for small data packets.

UI

User Interface.

VAX

Formally, Virtual Address Extension: the name of a classic minicomputer design developed by Digital Equipment Corporation (later merged with Compaq, later merged with Hewlett-Packard) from the PDP-11. The first VAX shipped in 1977. For ten years after 1980 VAXen were among the most important Unix platforms. Microprocessor reimplementations are still shipping today.

## B. References
Event timelines of the Unix Industry <http://snap.nlc.dcccd.edu/learn/drkelly/hst-hand.htm> and of GNU/Linux and Unix <http://www.robotwisdom.com/linux/timeline.html> are available on the Web. A timeline tree of Unix releases <http://www.levenez.com/unix/> is also available.


[Appleton] Randy Appleton. Improving Context Switching Performance of Idle Tasks under Linux. 2001. Cited on: 158.

Available on the Web <http://cs.nmu.edu/~randy/Research/Papers/Scheduler/>.

[Baldwin-Clark] Carliss Baldwin and Kim Clark. Design Rules, Vol 1: The Power of Modularity. MIT Press. 2000. ISBN 0-262-024667. Cited on: 83.

[Bentley] Jon Bentley. Programming Pearls (2nd Edition). Addison-Wesley. 2000. ISBN 0-201-65788-0. Cited on: 215.

The third essay in this book, “Data Structures Programs”, argues a case similar to that of Chapter 9 with Bentley’s characteristic eloquence. Some of the book is available on the Web <http://www.cs.bell-labs.com/cm/cs/pearls/>.

[BlaauwBrooks] Gerrit A. Blaauw and Frederick P. Brooks. Computer Architecture: Concepts and Evolution. Addison-Wesley. 1997. ISBN 0-201-10557-8. Cited on: 98, 394.

[Bolinger-Bronson] Dan Bolinger and Tan Bronson. Applying RCS and SCCS. O’Reilly & Associates. 1995. ISBN 1-56592-117-8. Cited on: 367.

Not just a cookbook, this also surveys the design issues in version-control systems.

[Brokken] Frank Brokken. C++ Annotations Version. 2002. Cited on: 329.

Available on the Web <http://www.icce.rug.nl/documents/cplusplus/cplusplus.html>.

[BrooksD] David Brooks. Converting a UNIX .COM Site to Windows. 2000. Cited on: 59.

Available on the Web <http://www.securityoffice.net/mssecrets/hotmail.html#_Toc491601819>.

[Brooks] Frederick P. Brooks. The Mythical Man-Month (20th Anniversary Edition). Addison-Wesley. 1995. ISBN 0-201-83595-9. Cited on: 12, 14, 300, 438.

[Boehm] Hans Boehm. Advantages and Disadvantages of Conservative Garbage Collection. Cited on: 323.

Thorough discussion of tradeoffs between garbage-collected and non-garbagecollected environments. Available on the Web <http://www.hpl.hp.com/personal/Hans_Boehm/gc/issues.html>.

[Cameron] Debra Cameron, Bill Rosenblatt, and Eric Raymond. Learning GNU Emacs (2nd Edition). O’Reilly & Associates. 1996. ISBN 1-56592-152-6. Cited on: 352.

[Cannon] L. W. Cannon, R. A. Elliot, L. W. Kirchhoff, J. A. Miller, J. M. Milner, R. W. Mitzw, E. P. Schan, N. O. Whittington, Henry Spencer, David Keppel, and Mark Brader. Recommended C Style and Coding Standards. 1990. Cited on: 410.

An updated version of the Indian Hill C Style and Coding Standards paper, with modifications by the last three authors. It describes a recommended coding standard for C programs. Available on the Web <http://www.apocalypse.org/pub/u/paul/docs/cstyle/cstyle.htm>.

[Christensen] Clayton Christensen. The Innovator’s Dilemma. HarperBusiness. 2000. ISBN 0-066-62069-4. Cited on: 52.

The book that introduced the term “disruptive technology”. A fascinating and lucid examination of how and why technology companies doing everything right get mugged by upstarts. A business book technical people should read.

[Cooper] Alan Cooper. The Inmates Are Running the Asylum. Sams. 1999. ISBN 0-672-31649-8. Cited on: 477.

Despite some occasional quirks and crotchets, this book is a trenchant and brilliant analysis of what’s wrong with software interface designs, and how to put it right.

[Comer] Douglas Comer. “Pervasive Unix: Cause for Celebration”. Unix Review, October 1985, p. 42. Cited on: 34.

[Coram-Lee] Tod Coram and Ji Lee. Experiences—A Pattern Language for User Interface Design. 1996. Cited on: 266.

Available on the Web <http://www.maplefish.com/todd/papers/Experiences.html>.

[DuBois] Paul DuBois. Software Portability with Imake. O’Reilly & Associates. 1993. ISBN 1-56592-055-4. Cited on: 363.

[Eckel] Bruce Eckel. Thinking in Java (3rd Edition). Prentice-Hall. 2003. ISBN 0-13-100287-2. Cited on: 341.

Available on the Web <http://www.mindview.net/Books/TIJ/>.

[Feller-Fitzgerald] Joseph Feller and Brian Fitzgerald. Understanding Open Source Software. Addison-Wesley. 2002. ISBN 0-201-73496-6. Cited on: 438.

[FlanaganJava] David Flanagan. Java in a Nutshell. O’Reilly & Associates. 1997. ISBN 1-56592-262-X. Cited on: 341.

[FlanaganJavaScript] David Flanagan. JavaScript: The Definitive Guide (4th Edition). O’Reilly & Associates. 2002. ISBN 1-596-00048-0. Cited on: 206.

[Fowler] Martin Fowler. Refactoring. Addison-Wesley. 1999. ISBN 0-201-48567-2. Cited on: 90.

[Friedl] Jeffrey Friedl. Mastering Regular Expressions (2nd Edition). O’Reilly & Associates. 2002. ISBN 0-596-00289-0. Cited on: 188.

[Fuzz] Barton Miller, David Koski, Cjin Pheow Lee, Vivekananda Maganty, Ravi Murthy, Ajitkumar Natarajan, and Jeff Steidl. Fuzz Revisited: A Re-examination of the Reliability of Unix Utilities and Services. 2000. Cited on: 9.

Available on the Web <http://www.opensource.org/advocacy/fuzz-revisited.pdf>.

[GangOfFour] Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides. Design Patterns: Elements of Reusable Object-Oriented Software. Addison-Wesley. 1997. ISBN 0-201-63361-2. Cited on: xxx.

[Gabriel] Richard Gabriel. Good News, Bad News, and How to Win Big. 1990. Cited on: 298, 438.

Available on the Web <http://www.dreamsongs.com/WorseIs-Better.html>.

[Gancarz] Mike Gancarz. The Unix Philosophy. Digital Press. 1995. ISBN 1-55558-123-4. Cited on: xxvi.

[Garfinkel] Simson Garfinkel, Daniel Weise, and Steve Strassman. The Unix Hater’s Handbook. IDG Books. 1994. ISBN 1-56884-203-1. Cited on: 5.

Available on the Web <http://research.microsoft.com/~daniel/unix-haters.html>.

[Gentner-Nielsen] Don Gentner and Jacob Nielsen. “The Anti-Mac Interface”. Communications of the ACM, Association for Computing Machinery. August 1996. Cited on: 261.

Available on the Web <http://www.acm.org/cacm/AUG96/antimac.htm>.

[Gettys] Jim Gettys. The Two-Edged Sword. 1998. Cited on: 7.

Available on the Web <http://freshmeat.net/articles/view/122/>.

[Glickstein] Bob Glickstein. Writing GNU Emacs Extensions. O’Reilly & Associates. 1997. ISBN 1-56592-261-1. Cited on: 343.

[Graham] Paul Graham. A Plan for Spam. Cited on: 218.

Available on the Web <http://www.paulgraham.com/spam.html>.

[Harold-Means] Elliotte Rusty Harold and W. Scott Means. XML in a Nutshell (2nd Edition). O’Reilly & Associates. 2002. ISBN 0-596-00292-0. Cited on: 117, 434.

[Hatton97] Les Hatton. “Re-examining the Defect-Density versus Component Size Distribution”. IEEE Software, March/April 1997. Cited on: 86.

Available on the Web <http://www.cs.ukc.ac.uk/people/staff/lh8/pubs/pubis697/Ubend_IS697.pdf.gz>.

[Hatton98] Les Hatton. “Does OO Sync with the Way We Think?” IEEE Software, 15 (3). Cited on: 328.

Available on the Web <http://www.cs.ukc.ac.uk/people/staff/lh8/pubs/pubis698/OO_IS698.pdf.gz>.

[Hauben] Ronda Hauben. History of UNIX. Cited on: 34.

Available on the Web <http://www.dei.isep.ipp.pt/docs/unix.html>.

[Heller] Steve Heller. C++: A Dialog: Programming with the C++ Standard Library. Prentice-Hall. 2003. ISBN 0-13-009402-1. Cited on: 329.

[Hunt-Thomas] Andrew Hunt and David Thomas. The Pragmatic Programmer: From Journeyman to Master. Addison-Wesley. 2000. ISBN 0-201-61622-X. Cited on: xxvii, 90.

[Kernighan95] Brian Kernighan. Experience with Tcl/Tk for Scientific and Engineering Visualization. USENIX Association Tcl/Tk Workshop Proceedings. 1995. Cited on: 335.

Available on the Web <http://www.usenix.org/publications/library/proceedings/tcl95/full_papers/kernighan.txt>.

[Kernighan-Ritchie] Brian Kernighan and Dennis Ritchie. The C Programming Language (2nd Edition). Prentice-Hall Software Series. 1988. ISBN 0-13-110362-8. Cited on: 94, 326, 395, 397.

[Kernighan-Pike84] Brian Kernighan and Rob Pike. The Unix Programming Environment. Prentice-Hall. 1984. ISBN 0-13-937681-X. Cited on: xxvi, 325, 331, 356.

[Kernighan-Pike99] Brian Kernighan and Rob Pike. The Practice of Programming. Addison-Wesley. 1999. ISBN 0-201-61586-X. Cited on: xxv, xxvii, 410.

An excellent treatise on writing high-quality programs, surely destined to become a classic of the field.

[Kernighan-Plauger] Brian Kernighan and P. J. Plauger. Software Tools. Addison-Wesley. 1976. ISBN 201-03669-X. Cited on: 14.

[Lampson] Butler Lampson. “Hints for Computer System Design”. ACM Operating Systems Review, Association for Computing Machinery. October 1983. Cited on: 26.

Available on the Web <http://research.microsoft.com/~lampson/33-Hints/WebPage.html>.

[Lapin] J. E. Lapin. Portable C and Unix Systems Programming. Prentice-Hall. 1987. ISBN 0-13-686494-5. Cited on: 397.

[Leonard] Andrew Leonard. BSD Unix: Power to the People, from the Code. 2000. Cited on: 35.

Available on the Web <http://dir.salon.com/tech/fsp/2000/05/16/chapter_2_part_one/index.html>.

[Levy] Steven Levy. Hackers: Heroes of the Computer Revolution. Anchor/Doubleday. 1984. ISBN 0-385-19195-2. Cited on: 44. Available on the Web <http://www.stanford.edu/group/mmdd/SiliconValley/Levy/Hackers.1984.book/contents.html>.

[Lewine] Donald Lewine. POSIX Programmer’s Guide: Writing Portable Unix Programs. O’Reilly & Associates. 1992. ISBN 0-937175-73-0. Cited on: 400.

[Libes-Ressler] Don Libes and Sandy Ressler. Life with Unix. Prentice-Hall. 1989. ISBN 0-13-536657-7. Cited on: 35.

This book gives a more detailed version of Unix’s early history. It’s particularly strong for the period 1979–1986.

[Lions] John Lions. Lions’s Commentary on Unix 6th Edition. Peer-To-Peer Communications. 1996. 1-57398-013-7. Cited on: 34.

PostScript rendering of Lions’s original floats around the Web. This URL may be unstable <http://www.upl.cs.wisc.edu/~epaulson/lionc.ps>.

[Loukides-Oram] Mike Loukides and Andy Oram. Programming with GNU Software. O’Reilly & Associates. 1996. ISBN 1-56592-112-7. Cited on: 350, 357.

[Lutz] Mark Lutz. Programming Python. O’Reilly & Associates. 1996. ISBN 1-56592-197-6. Cited on: 337.

[McIlroy78] M. D. McIlroy, E. N. Pinson, and B. A. Tague. “Unix Time-Sharing System Forward”. The Bell System Technical Journal, Bell Laboratories. 57 (6, part 2), 1978, p. 1902. Cited on: 11.

[McIlroy91] M. D. McIlroy. “Unix on My Mind”. In: Proc. Virginia Computer Users Conference, Volume 21, p. 1–6. Cited on: 32.

[Miller] George Miller. “The Magical Number Seven, Plus or Minus Two”. The Psychological Review, 63, 1956, pp. 81–97. Cited on: 88.

Available on the Web <http://www.well.com/user/smalin/miller.html>.

[Mumon] Mumon. The Gateless Gate. Cited on: 149.

A good modern translation is available on the Web <http://www.ibiblio.org/zen/cgi-bin/koan-index.pl>.

[OpenSources] Sam Ockman and Chris DiBona, eds. Open Sources: Voices from the Open Source Revolution. O’Reilly & Associates. 1999. ISBN 1-56592-582-3. Cited on: 61.

Available on the Web <http://www.oreilly.com/catalog/opensources/book/toc.html>.

[Oram-Talbot] Andrew Oram and Steve Talbot. Managing Projects with Make. O’Reilly & Associates. 1991. ISBN 0-937175-90-0. Cited on: 357.

[Ousterhout94] John Ousterhout. Tcl and the Tk Toolkit. Addison-Wesley. 1994. ISBN 0-201-63337-X.

[Ousterhout96] John Ousterhout. Why Threads Are a Bad Idea (for most purposes). 1996.An invited talk at USENIX 1996. There is no written paper that corresponds to it, but the slide presentation is available on the Web <http://home.pacbell.net/ouster/threads.pdf>.

[Padlipsky] Michael Padlipsky. The Elements of Networking Style. iUniverse.com. 2000. ISBN 0-595-08879-1. Cited on: 103, 462.

[Parnas] Parnas L. David. “On the Criteria to Be Used in Decomposing Systems into Modules”. Communications of the ACM. Cited on: 85.

Available on the Web at the ACM Classics page <http://www.acm.org/classics/may96/>.

[Pike] Rob Pike. Notes on Programming in C. Cited on: 12.

This document is popular on the Web; a title search is sure to find several copies. Here is one <http://www.lysator.liu.se/c/pikestyle.html>.

[Prechelt] Lutz Prechelt. An Empirical Comparison of C, C++, Java, Perl, Python, Rexx, and Tcl for a Search/String-Processing Program <http://www.ubka.uni-karlsruhe.de/cgi-bin/psview?document=ira/2000/5>. Cited on: 324.

[Raskin] Jef Raskin. The Humane Interface. Addison-Wesley. 2000. ISBN 0-201-37937-6. Cited on: 254.

A summary is available on the Web <http://humane.sourceforge.net/humane_interface/summary_of_thi.html>.

[Ravenbrook] The Memory Management Reference. Cited on: 22.

Available on the Web <http://www.memorymanagement.org/>.

[Raymond96] The New Hacker’s Dictionary (3rd Edition). MIT Press. 1996. ISBN 0-262-68092-0. Cited on: 45, 298.

Available on the Web at Jargon File Resource Page <http://www.catb.org/~esr/jargon>.

[Raymond01] Eric S. Raymond. The Cathedral and the Bazaar (2nd Edition). O’Reilly & Associates. 1999. ISBN 0-596-00131-2. Cited on: 49, 438, 474.

[Reps-Senzaki] Paul Reps and Nyogen Senzaki, eds. Zen Flesh, Zen Bones. Shambhala Publications. 1994. ISBN 1-570-62063-6. Cited on: xxvii.

A superb anthology of Zen primary sources, presented just as they are.

[Ritchie-Thompson] Dennis M. Ritchie and Ken Thompson. The Unix Time-Sharing System. Cited on: 33.

Available on the Web <http://cm.bell-labs.com/cm/cs/who/dmr/cacm.html>.

[Ritchie79] Dennis M. Ritchie. The Evolution of the Unix Time-Sharing System. 1979. Cited on: 30.

Available on the Web <http://cm.bell-labs.com/cm/cs/who/dmr/hist.html>.

[Ritchie93] Dennis M. Ritchie. The Development of the C Language. 1993. Cited on: 396.

Available on the Web <http://cm.bell-labs.com/cm/cs/who/dmr/chist.html>.

[RitchieQED] Dennis M. Ritchie. An Incomplete History of the QED Text Editor. 2003. Cited on: 304.

Available on the Web <http://cm.bell-labs.com/cm/cs/who/dmr/qed.html>.

[Salus] Peter H. Salus. A Quarter-Century of Unix. Addison-Wesley. 1994. ISBN 0-201-54777-5. Cited on: 12.

An excellent overview of Unix history, explaining many of the design decisions in the words of the people who made them.

[Schwartz-Christiansen] Randal Schwartz and Tom Phoenix. Learning Perl (3rd Edition). O’Reilly & Associates. 2001. ISBN 0-596-00132-0. Cited on: 333.

[Saltzer] James. H. Saltzer, David P. Reed, and David D. Clark. “End-to-End Arguments in System Design”. ACM Transactions on Computer Systems, Association for Computing Machinery. November 1984. Cited on: 123.

Available on the Web <http://web.mit.edu/Saltzer/www/publications/endtoend/endtoend.pdf>.

[Schaffer-Wolf] Evan Schaffer and Mike Wolf. The Unix Shell as a Fourth-Generation Language. 1991. Cited on: 162.

Available on the Web <http://www.rdb.com/lib/4gl.pdf>. An opensource implementation, NoSQL, is available and readily turned up by a Web search.

[Spinellis] Diomidis Spinellis. “Notable Design Patterns for Domain-Specific Languages”. Journal of Systems and Software, 56 (1), February 2001, p. 91–99. Cited on: 207.

Available on the Web <http://www.dmst.aueb.gr/dds/pubs/jrnl/2000-JSS-DSLPatterns/html/dslpat.html>.

[Stallman] Richard M. Stallman. The GNU Manifesto. Cited on: 39.

Available on the Web <http://www.gnu.org/gnu/manifesto.html>.

[Stephenson] Neal Stephenson. In the Beginning Was the Command Line. 1999. Cited on: 262.

Available on the Web <http://www.cryptonomicon.com/beginning.html>, and also as a trade paperback from Avon Books.

[Stevens90] W. Richard Stevens. Unix Network Programming. Prentice-Hall. 1990. ISBN 0-13-949876-1. Cited on: 177.

The classic on this topic. Note: Some later editions of this book omit coverage of the Version 6 networking facilities like mx().

[Stevens92] W. Richard Stevens. Advanced Programming in the Unix Environment. Addison-Wesley. 1992. ISBN 0-201-56317-7. Cited on: xxv.

Stevens’s comprehensive guide to the Unix API. A feast for the experienced programmer or the bright novice, and a worthy companion to Unix Network Programming.

[Stroustrup] Bjarne Stroustrup. The C++ Programming Language. Addison-Wesley. 1991. ISBN 0-201-53992-6. Cited on: 329.

[Tanenbaum-VanRenesse] Andrew S. Tanenbaum and Robbert van Renesse. A Critique of the Remote Procedure Call Paradigm. EUTECO’88 Proceedings, Participants Edition. 1988. Cited on: 179.

[Tidwell] Doug Tidwell. XSLT: Mastering XML Transformations. O’Reilly & Associates. 2001. ISBN 1-596-00053-7. Cited on: 194.

[Torvalds] Linus Torvalds and David Diamond. Just for Fun: The Story of an Accidental Revolutionary. HarperBusiness. 2001. ISBN 0-06-662072-4. Cited on: 394, 402.

[Vaughan] Gary V. Vaughan, Tom Tromey, and Ian Lance Taylor. GNU Autoconf, Automake, and Libtool. New Riders Publishing. 2000. ISBN 1-578-70190-2. Cited on: 364.

A user’s guide to the GNU autoconfiguration tools. Available on the Web <http://sources.redhat.com/autobook/>.

[Vo] Kiem-Phong Vo. “The Discipline and Method Architecture for Reusable Libraries”. Software Practice & Experience, 30, 2000, p. 107–128. Cited on: 100.

Available on the Web <http://www.research.att.com/sw/tools/vcodex/dm-spe.ps>.

[Wall2000] Larry Wall, Tom Christiansen, and Jon Orwant. Programming Perl (3rd Edition). O’Reilly & Associates. 2000. ISBN 0-596-00027-8. Cited on: 333.

[Welch] Brent Welch. Practical Programming in Tcl and Tk. Prentice-Hall. 1999. ISBN 0-13-022028-0. Cited on: 335.

[Williams] Sam Williams. Free as in Freedom. O’Reilly & Associates. 2002. ISBN 0-596-00287-4. Cited on: 46. Available on the Web <http://www.oreilly.com/openbook/freedom/index.html>.

[Yourdon] Edward Yourdon. Death March: The Complete Software Developer’s Guide to Surviving “Mission Impossible” Projects. Prentice-Hall. 1997. ISBN 0-137-48310-4. Cited on: 377.

## C. Contributors

Anyone who has attended a USENIX conference in a fancy hotel can tell you that a sentence like “You’re one of those computer people, aren’t you?” is roughly equivalent to “Look, another amazingly mobile form of slime mold!” in the mouth of a hotel cocktail waitress.

—Elizabeth Zwicky

Ken Arnold was part of the group that created the 4BSD Unix releases. He wrote the original curses(3) library and was one of the authors of the original rogue(6) game. He is a co-author of the Java Reference Manual, and one of the leading experts on Java and OO techniques.

Steven M. Bellovin created Usenet (with Tom Truscott and Jim Ellis) while at University of North Carolina in 1979. In 1982 he joined AT&T Bell Laboratories, where he has done pioneering research in security, cryptography, and networking on Unix systems and elsewhere. He is an active member of the Internet Engineering Task Force, and a member of the National Academy of Engineering.

Stuart Feldman was a member of the Bell Labs Unix development group. He wrote make(1) and f77(1). He is now the vice-president in charge of computing research at IBM.

Jim Gettys was, with Bob Scheifler and Keith Packard, one of the principal architects of the X windowing system in the late 1980s. He wrote much of the X library, the X license, and articulated the “mechanism, not policy” central credo of the X design.

Steve Johnson wrote yacc(1) and then used it to write the Portable C Compiler, which replaced the original DMR C and became the ancestor of most later Unix C compilers.

Brian Kernighan has been the Unix community’s single most articulate exponent of good style. He has authored or coauthored several books that are indispensable classics of the tradition, including The Practice of Programming, The C Programming Language, The Unix Programming Environment. While at Bell Labs, he coauthored the awk(1) language and had a major hand in the development of the troff family of tools, including eqn(1) (co-written with Lorinda Cherry), pic(1), and grap(1) (Jon Bentley).

David Korn wrote the Korn shell, the stylistic ancestor of almost all modern Unix shell designs. He created UWIN, a UNIX emulator for those that are forced to use Windows. David has also done research in the design of file systems and tools for source-code portability.

Mike Lesk was part of the original Unix crew at Bell Labs. Among other contributions, he wrote the ms macro package, the tbl(1) and refer(1) tools for word processing, the lex(1) lexical-analyzer generator, and UUCP (Unix-to-Unix copy program).

Doug McIlroy headed the research group at Bell Labs where Unix was born and invented the Unix pipe. He wrote spell(1), diff(1), sort(1), join(1), tr(1), and other classic Unix tools, and helped define the traditional style of Unix documentation. He has also done pioneering work in storage-allocation algorithms, computer security, and theorem-proving.

Marshall Kirk McKusick implemented the 4.2BSD fast file system and was the Research Computer Scientist at the Berkeley Computer Systems Research Group (CSRG) overseeing the development and release of 4.3BSD and 4.4BSD.

Keith Packard was a major contributor to the original X11 code. During a second phase of involvement beginning in 1999, Keith rewrote the X rendering code, producing a more powerful but dramatically smaller implementation suitable for handheld computers and PDAs.

Eric S. Raymond has been writing Unix software since 1982. In 1991 he edited The New Hacker’s Dictionary, and has since been studying the Unix community and the Internet hacker culture from a historical and anthropological perspective. In 1997 that study produced The Cathedral and the Bazaar, that helped (re)define and energize the open-source movement. He presently maintains more than thirty open-source software projects and about a dozen key FAQ documents.

Henry Spencer was a leader among the first wave of programmers to embrace Unix when it escaped from Bell Labs in the mid-1970s. His contributions included the public-domain getopt(3), the first open-source string library, and an open-source regular-expression engine which found use in 4.4BSD and as the reference for the POSIX standard. He is also a noted expert on the arcana of C. He was a coauthor of C News, and has for many years been a voice of reason on Usenet and one of its most respected regulars.

Ken Thompson invented Unix.

## D. Rootless Root: The Unix Koans of Master Foo
image


Editor’s Introduction
The discovery of the collection of koans known as the Rootless Root, apparently preserved for decades in the dry upper air of the Western Mountains, has ignited great controversy in scholarly circles. Are these authentic documents shedding new light on the teaching of the early Unix patriarchs? Or are they clever pastiches from a later age, commanding the authority of semi-mythical figures such as the Patriarchs Thompson, Ritchie and McIlroy for doctrines which evolved closer to our own era?

It is impossible to say for certain. All sides in the dispute have made much of an alleged similarity to that venerable classic, The Tao of Programming.1 But Rootless Root is quite different in tone and style from the loose, poetic anecdotes of the James translation, focused as it is on the remarkable and enigmatic figure of Master Foo.

1 The Tao of Programming is available on the Web <http://www.canonical.org/~kragen/tao-of-programming.html>.

It would be more apposite to seek parallels in the AI Koans;2 indeed, there are textual clues that the author of the Rootless Root may have redacted certain versions of the AI Koans. We are also on much firmer ground in seeking connections with the Loginataka;3 indeed, it is quite possible that the unknown authors of Rootless Root and of Loginataka were one and the same person, possibly a student of Master Foo himself.

2 The AI Koans are available on the Web <http://www.catb.org/~esr/jargon/html/Some-AI-Koans.html>.

3 The Loginataka is available on the Web <http://www.catb.org/~esr/faqs/loginataka.html>.

Mention should also be made of the Tales of Zen Master Greg,4 though the Nine Inch Nails references have cast some doubt on their antiquity and it is thus unlikely that they influenced Rootless Root.

4 The Tales of Zen Master Greg are available on the Web <http://www.gu.uwa.edu.au/users/greg/>.

That the title of the work was intended as a reference to the Zen classic Gateless Gate5 of Mumon, we can say with fair confidence. There are echoes of Mumon in several of the koans.

5 The Gateless Gate is available on the Web <http://www.ibiblio.org/zen/cgi-bin/koan-index.pl>.

There is considerable dispute over whether Master Foo should be assigned to the Eastern (New Jersey) School, or the Western School that grew out of the Patriarch Thompson’s epochal early journey to Berkeley. If this question has not been settled, it is perhaps because we cannot even establish that Master Foo ever existed! He might merely be a composite of a group of teachers, or of an entire dharma lineage.

Even supposing the legend of Master Foo accreted around the teaching of some a single person, what of his favored student Nubi? Nubi has all the earmarks of a stock figure, the perfect disciple. One is reminded of the tales surrounding the Buddha’s favorite follower Ananda. It seems likely that there was a historical Ananda, but no trace of his actual personality has survived the euhemerizing process by which the life of the Buddha was polished into timeless myth.

In the end, all we can do is take these teaching stories on their own terms, and extract what kernels of wisdom may be found there.

The redaction of the Rootless Root is a work in progress, as the source materials present many difficulties in reconstruction and interpretation. Future versions may include more stories as these difficulties are overcome.


Master Foo and the Ten Thousand Lines
Master Foo once said to a visiting programmer: “There is more Unix-nature in one line of shell script than there is in ten thousand lines of C”.

The programmer, who was very proud of his mastery of C, said: “How can this be? C is the language in which the very kernel of Unix is implemented!”

Master Foo replied: “That is so. Nevertheless, there is more Unix-nature in one line of shell script than there is in ten thousand lines of C”.

The programmer grew distressed. “But through the C language we experience the enlightenment of the Patriarch Ritchie! We become as one with the operating system and the machine, reaping matchless performance!”

Master Foo replied: “All that you say is true. But there is still more Unix-nature in one line of shell script than there is in ten thousand lines of C”.

The programmer scoffed at Master Foo and rose to depart. But Master Foo nodded to his student Nubi, who wrote a line of shell script on a nearby whiteboard, and said: “Master programmer, consider this pipeline. Implemented in pure C, would it not span ten thousand lines?”

The programmer muttered through his beard, contemplating what Nubi had written. Finally he agreed that it was so.

“And how many hours would you require to implement and debug that C program?” asked Nubi.

“Many”, admitted the visiting programmer. “But only a fool would spend the time to do that when so many more worthy tasks await him”.

“And who better understands the Unix-nature?” Master Foo asked. “Is it he who writes the ten thousand lines, or he who, perceiving the emptiness of the task, gains merit by not coding?”

Upon hearing this, the programmer was enlightened.


Master Foo and the Script Kiddie
A stranger from the land of Woot came to Master Foo as he was eating the morning meal with his students.

“I hear y00 are very l33t”, he said. “Pl33z teach m3 all y00 know”.

Master Foo’s students looked at each other, confused by the stranger’s barbarous language. Master Foo just smiled and replied: “You wish to learn the Way of Unix?”

“I want to b3 a wizard hax0r”, the stranger replied, “and 0wn ever3one’s b0xen”.

“I do not teach that Way”, replied Master Foo.

The stranger grew agitated. “D00d, y00 r nothing but a p0ser”, he said. “If y00 n00 anything, y00 wud t33ch m3”.

“There is a path”, said Master Foo, “that might bring you to wisdom”. The master scribbled an IP address on a piece of paper. “Cracking this box should pose you little difficulty, as its guardians are incompetent. Return and tell me what you find”.

The stranger bowed and left. Master Foo finished his meal.

Days passed, then months. The stranger was forgotten.

Years later, the stranger from the land of Woot returned.

“Damn you!” he said, “I cracked that box, and it was easy like you said. But I got busted by the FBI and thrown in jail”.

“Good”, said Master Foo. “You are ready for the next lesson”. He scribbled an IP address on another piece of paper and handed it to the stranger.

“Are you crazy?” the stranger yelled. “After what I’ve been through, I’m never going to break into a computer again!”

Master Foo smiled. “Here”, he said, “is the beginning of wisdom”.

On hearing this, the stranger was enlightened.


Master Foo Discourses on the Two Paths
Master Foo instructed his students:

“There is a line of dharma teaching, exemplified by the Patriarch McIlroy’s mantra ’Do one thing well’, which emphasizes that software partakes of the Unix way when it has simple and consistent behavior, with properties that can be readily modeled by the mind of the user and used by other programs”.

“But there is another line of dharma teaching, exemplified by the Patriarch Thompson’s great mantra ’When in doubt, use brute force’, and various sutras on the value of getting 90% of cases right now, rather than 100% later, which emphasizes robustness and simplicity of implementation”.

“Now tell me: which programs have the Unix nature?”

After a silence, Nubi observed:

“Master, these teachings may conflict”.

“A simple implementation is likely to lack logic for edge cases, such as resource exhaustion, or failure to close a race window, or a timeout during an uncompleted transaction”.

“When such edge cases occur, the behavior of the software will become irregular and difficult. Surely this is not the Way of Unix?”

Master Foo nodded in agreement.

“On the other hand, it is well known that fancy algorithms are brittle. Further, each attempt to cover an edge case tends to interact with both the program’s central algorithms and the code covering other edge cases”.

“Thus, attempts to cover all edge cases in advance, guaranteeing ’simplicity of description’, may in fact produce code that is overcomplicated and brittle or which, plagued by bugs, never ships at all. Surely this is not the Way of Unix?”

Master Foo nodded in agreement.

“What, then, is the proper dharma path?” asked Nubi.

The master spoke:

“When the eagle flies, does it forget that its feet have touched the ground? When the tiger lands upon its prey, does it forget its moment in the air? Three pounds of VAX!”

On hearing this, Nubi was enlightened.


Master Foo and the Methodologist
When Master Foo and his student Nubi journeyed among the sacred sites, it was the Master’s custom in the evenings to offer public instruction to Unix neophytes of the towns and villages in which they stopped for the night.

On one such occasion, a methodologist was among those who gathered to listen.

“If you do not repeatedly profile your code for hot spots while tuning, you will be like a fisherman who casts his net in an empty lake”, said Master Foo.

“Is it not, then, also true”, said the methodology consultant, “that if you do not continually measure your productivity while managing resources, you will be like a fisherman who casts his net in an empty lake?”

“I once came upon a fisherman who just at that moment let his net fall in the lake on which his boat was floating”, said Master Foo. “He scrabbled around in the bottom of his boat for quite a while looking for it”.

“But”, said the methodologist, “if he had dropped his net in the lake, why was he looking in the boat?”

“Because he could not swim”, replied Master Foo.

Upon hearing this, the methodologist was enlightened.


Master Foo Discourses on the Graphical User Interface
One evening, Master Foo and Nubi attended a gathering of programmers who had met to learn from each other. One of the programmers asked Nubi to what school he and his master belonged. Upon being told they were followers of the Great Way of Unix, the programmer grew scornful.

“The command-line tools of Unix are crude and backward”, he scoffed. “Modern, properly designed operating systems do everything through a graphical user interface”.

Master Foo said nothing, but pointed at the moon. A nearby dog began to bark at the master’s hand.

“I don’t understand you!” said the programmer.

Master Foo remained silent, and pointed at an image of the Buddha. Then he pointed at a window.

“What are you trying to tell me?” asked the programmer.

Master Foo pointed at the programmer’s head. Then he pointed at a rock.

“Why can’t you make yourself clear?” demanded the programmer.

Master Foo frowned thoughtfully, tapped the the programmer twice on the nose, and dropped him in a nearby trashcan.

As the programmer was attempting to extricate himself from the garbage, the dog wandered over and piddled on him.

At that moment, the programmer achieved enlightenment.


Master Foo and the Unix Zealot
A Unix zealot, having heard that Master Foo was wise in the Great Way, came to him for instruction. Master Foo said to him:

“When the Patriarch Thompson invented Unix, he did not understand it. Then he gained in understanding, and no longer invented it”.

“When the Patriarch McIlroy invented the pipe, he knew that it would transform software, but did not know that it would transform mind”.

“When the Patriarch Ritchie invented C, he condemned programmers to a thousand hells of buffer overruns, heap corruption, and stale-pointer bugs”.

“Truly, the Patriarchs were blind and foolish!”

The zealot was greatly angered by the Master’s words.

“These enlightened ones”, he protested. “gave us the Great Way of Unix. Surely, if we mock them we will lose merit and be reborn as beasts or MCSEs”.

“Is your code ever completely without stain and flaw?” demanded Master Foo.

“No”, admitted the zealot, “no man’s is”.

“The wisdom of the Patriarchs”, said Master Foo, “was that they knew they were fools”.

Upon hearing this, the zealot was enlightened.


Master Foo Discourses on the Unix-Nature
A student said to Master Foo: “We are told that the firm called SCO holds true dominion over Unix”.

Master Foo nodded.

The student continued, “Yet we are also told that the firm called OpenGroup also holds true dominion over Unix”.

Master Foo nodded.

“How can this be?” asked the student.

Master Foo replied:

“SCO indeed has dominion over the code of Unix, but the code of Unix is not Unix. OpenGroup indeed has dominion over the name of Unix, but the name of Unix is not Unix”.

“What, then, is the Unix-nature?” asked the student.

Master Foo replied:

“Not code. Not name. Not mind. Not things. Always changing, yet never changing”.

“The Unix-nature is simple and empty. Because it is simple and empty, it is more powerful than a typhoon”.

“Moving in accordance with the law of nature, it unfolds inexorably in the minds of programmers, assimilating designs to its own nature. All software that would compete with it must become like to it; empty, empty, profoundly empty, perfectly void, hail!”

Upon hearing this, the student was enlightened.


Master Foo and the End User
On another occasion when Master Foo gave public instruction, an end user, having heard tales of the Master’s wisdom, came to him for guidance.

He bowed three times to Master Foo. “I wish to learn the Great Way of Unix”, he said “but the command line confuses me”.

Some of the onlooking neophytes began to mock the end user, calling him “clueless” and saying that the Way of Unix is only for those of discipline and intelligence.

The Master held up a hand for silence, and called the most obstreperous of the neophytes who had mocked forward, to where he and the end user sat.

“Tell me”, he asked the neophyte, “of the code you have written and the works of design you have uttered”.

The neophyte began to stammer out a reply, but fell silent.

Master Foo turned to the end-user. “Tell me”, he inquired, “why do you seek the Way?”

“I am discontent with the software I see around me”, the end user replied. “It neither performs reliably nor pleases the eye and hand. Having heard that the Unix way, though difficult, is superior, I seek to cast aside all snares and delusions”.

“And what do you do in the world”, asked Master Foo, “that you must strive with software?”

“I am a builder”, the end user replied, “Many of the houses of this town were made under my chop”.

Master Foo turned back to the neophyte. “The housecat may mock the tiger”, said the master, “but doing so will not make his purr into a roar”.

Upon hearing this, the neophyte was enlightened.

## Colophon

No proprietary software was used during the composition of this book. Drafts were typeset from XML-DocBook master files created with GNU Emacs. PostScript generation was performed with Tim Waugh’s xmlto, Norman Walsh’s XSL stylesheets, Daniel Veillard’s xsltproc, Sebastian Rahtz’s PassiveTeX macros, the TeTeX distribution of Donald Knuth’s TEX typesetter, and Thomas Rokicki’s dvips postprocessor. All the diagrams were composed by the author using pic2graph driving gpic and grap2graph driving Ted Faber’s grap implementation (grap2graph was written by the author for this project and is now part of the groff distribution). The entire toolchain was hosted by stock Red Hat Linux. Production typesetting was done by Alina Kirsanova.

The cover art is a composite of two images from the original Zen Comics by Ioanna Salajan. It was adapted and colored mainly by Jerry Votta, but the author and GIMP had a hand in the work.