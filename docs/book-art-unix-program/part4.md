# Part IV. Community

[[toc]]

## 17. Portability: Software Portability and Keeping Up Standards

The realization that the operating systems of the target machines were as great an obstacle to portability as their hardware architecture led us to a seemingly radical suggestion: to evade that part of the problem altogether by moving the operating system itself.

—Portability of C Programs and the UNIX System (1978)

Unix was the first production operating system to be ported between differing processor families (Version 6 Unix, 1976–77). Today, Unix is routinely ported to every new machine powerful enough to sport a memory-management unit. Unix applications are routinely moved between Unixes running on wildly differing hardware; in fact, it is unheard of for a port to fail.

Portability has always been one of Unix’s principal advantages. Unix programmers tend to write on the assumption that hardware is evanescent and only the Unix API is stable, making as few assumptions as possible about machine specifics such as word length, endianness or memory architecture. In fact, code that is hardware-dependent in any way that goes beyond the abstract machine model of C is considered bad form in Unix circles, and only really tolerated in very special cases like operating system kernels.

Unix programmers have learned that it is easy to be wrong when anticipating that a software project will have a short lifetime.1 Thus, they tend to avoid making software dependent on specific and perishable technologies, and to lean heavily on open standards. These habits of writing for portability are so ingrained in the Unix tradition that they are applied even to small single-use projects that are thought of as throwaway code. They have had secondary effects all through the design of the Unix development toolkit, and on programming languages like Perl and Python and Tcl that were developed under Unix.

1 PDP-7 Unix and Linux were both examples of unexpected persistence. Unix originated as a research toy hacked together by some researchers between projects, half to play with file-system ideas and half to host a game. The second was summed up by its creator as “My terminal emulator grew legs” [Torvalds].

The direct benefit of portability is that it is normal for Unix software to outlive its original hardware platform, so tools and applications don’t have to be reinvented every few years. Today, applications originally written for Version 7 Unix (1979) are routinely used not merely on Unixes genetically descended from V7, but on variants like Linux in which the operating system API was written from a Unix specification and shares no code with the Bell Labs source tree.

The indirect benefits are less obvious but may be more important. The discipline of portability tends to exert a simplifying influence on architectures, interfaces, and implementations. This both increases the odds of project success and reduces life-cycle maintenance costs.

In this chapter, we’ll survey the scope and history of Unix standards. We’ll discuss which ones are still relevant today and describe the areas of greater and lesser variance in the Unix API. We’ll examine the tools and practices that Unix developers use to keep code portable, and develop some guides to good practice.


### 17.1 Evolution of C
The central fact of the Unix programming experience has always been the stability of the C language and the handful of service interfaces that always travel with it (notably, the standard I/O library and friends). The fact that a language originated in 1973 has required as little change as this one has in thirty years of heavy use is truly remarkable, and without parallels anywhere else in computer science or engineering.

In Chapter 4, we argued that C has been successful because it acts as a layer of thin glue over computer hardware approximating the “standard architecture” of [BlaauwBrooks]. There is, of course, more to the story than that. To understand the rest of the story, we’ll need to take a brief look at the history of C.


#### 17.1.1 Early History of C
C began life in 1971 as a systems-programming language for the PDP-11 port of Unix, based on Ken Thompson’s earlier B interpreter which had in turn been modeled on BCPL, the Basic Common Programming Language designed at Cambridge University in 1966–67.2

2 The ’C’ in C therefore stands for Common—or, perhaps, for ’Christopher’. BCPL originally stood for “Bootstrap CPL”—a much simplified version of CPL, the very interesting but overly ambitious and never implemented Common Programming Language of Oxford and Cambridge, also known affectionately as “Christopher’s Programming Language” after its prime advocate, computer-science pioneer Christopher Strachey.

Dennis Ritchie’s original C compiler (often called the “DMR” compiler after his initials) served the rapidly growing community around Unix versions 5, 6, and 7. Version 6 C spawned Whitesmiths C, a reimplementation that became the first commercial C compiler and the nucleus of IDRIS, the first Unix workalike. But most modern C implementations are patterned on Steven C. Johnson’s “portable C compiler” (PCC) which debuted in Version 7 and replaced the DMR compiler entirely in both System V and the BSD 4.x releases.

In 1976, Version 6 C introduced the typedef, union, and unsigned int declarations. The approved syntax for variable initializations and some compound operators also changed.

The original description of C was Brian Kernighan and Dennis M. Ritchie’s original The C Programming Language aka “the White Book” [Kernighan-Ritchie]. It was published in 1978, the same year the Whitemiths C compiler became available.

The White Book described enhanced Version 6 C, with one significant exception involving the handling of public storage. Ritchie’s original intention had been to model C’s rules on FORTRAN COMMON declarations, on the theory that any machine that could handle FORTRAN would be ready for C. In the common-block model, a public variable may be declared multiple times; identical declarations are merged by the linker. But two early C ports (to Honeywell and IBM 360 mainframes) happened to be to machines with very limited common storage or a primitive linker or both. Thus, the Version 6 C compiler was moved to the stricter definition-reference model (requiring at most one definition of any given public variable and the extern keyword tagging references to it) described in [Kernighan-Ritchie].

This decision was reversed in the C compiler that shipped with Version 7 after it developed that a great deal of existing source depended on the looser rules. Pressure for backward-compatibility would foil yet another attempt to switch (in 1983’s System V Release 1) before the ANSI Draft Standard finally settled on definition-reference rules in 1988. Common-block public storage is still admitted as an acceptable variation by the standard.

V7 C introduced enum and treated struct and union values as first-class objects that could be assigned, passed as arguments, and returned from functions (rather than being passed around by address).

Another major change in V7 was that Unix data structure declarations were now documented on header files, and included. Previous Unixes had actually printed the data structures (e.g., for directories) in the manual, from which people would copy it into their code. Needless to say, this was a major portability problem.

—Steve Johnson

The System III C version of the PCC compiler (which also shipped with BSD 4.1c) changed the handling of struct declarations so that members with the same names in different structs would not clash. It also introduced void and unsigned char declarations. The scope of extern declarations local to a function was restricted to the function, and no longer included all code following it.

The ANSI C Draft Proposed Standard added const (for read-only storage) and volatile (for locations such as memory-mapped I/O registers that might be modified asynchronously from the thread of program control). The unsigned type modifier was generalized to apply to any type, and a symmetrical signed was added. Initialization syntax for auto array and structure initializers and union types was added. Most importantly, function prototypes were added.

The most important changes in early C were the switch to definition-reference and the introduction of function prototypes in the Draft Proposed ANSI C Standard. The language has been essentially stable since copies of the X3J11 committee’s working papers on the Draft Proposed Standard signaled the committee’s intentions to compiler implementers in 1985–1986.

A more detailed history of early C, written by its designer, can be found at [Ritchie93].


#### 17.1.2 C Standards
C standards development has been a conservative process with great care taken to preserve the spirit of the original C language, and an emphasis on ratifying experiments in existing compilers rather than inventing new features. The C9X charter3 document is an excellent expression of this mission.

3 Available on the Web <http://anubis.dkuug.dk/JTC1/SC22/WG14/www/charter>.

Work on the first official C standard began in 1983 under the auspices of the X3J11 ANSI committee. The major functional additions to the language were settled by the end of 1986, at which point it became common for programmers to distinguish between “K&R C” and “ANSI C”.

Many people don’t realize how unusual the C standardization effort, especially the original ANSI C work, was in its insistence on standardizing only tested features. Most language standard committees spend much of their time inventing new features, often with little consideration of how they might be implemented. Indeed, the few ANSI C features that were invented from scratch—e.g., the notorious “trigraphs”—were the most disliked and least successful features of C89.

—Henry Spencer

Void pointers were invented as part of the standards effort, and have been a winner. But Henry’s point is still well taken.

—Steve Johnson

While the core of ANSI C was settled early, arguments over the contents of the standard libraries dragged on for years. The formal standard was not issued until the end of 1989, well after most compilers had implemented the 1985 recommendations. The standard was originally known as ANSI X3.159, but was redesignated ISO/IEC 9899:1990 when the International Standards Organization (ISO) took over sponsorship in 1990. The language variant it describes is generally known as C89 or C90.

The first book on C and Unix portability practice, Portable C and Unix Systems Programming [Lapin], was published in 1987 (I wrote it under a corporate pseudonym forced on me by my employers at the time). The Second Edition of [Kernighan-Ritchie] came out in 1988.

A very minor revision of C89, known as Amendment 1, AM1, or C93, was floated in 1993. It added more support for wide characters and Unicode. This became ISO/IEC 9899–1:1994.

Revision of the C89 standard began in 1993. In 1999, ISO/IEC 9899 (generally known as C99) was adopted by ISO. It incorporated Amendment 1, and added a great many minor features. Perhaps the most significant one for most programmers is the C++-like ability to declare variables at any point in a block, rather than just at the beginning. Macros with a variable number of arguments were also added.

The C9X working group has a Web page <http://anubis.dkuug.dk/JTC1/SC22/WG14/www/projects>, but no third standards effort is planned as of mid-2003. They are developing an addendum on C for embedded systems.

Standardization of C has been greatly aided by the fact that working and largely compatible implementations were running on a wide variety of systems before standards work was begun. This made it harder to argue about what features should be in the standard.


### 17.2 Unix Standards
The 1973 rewrite of Unix in C made it unprecedentedly easy to port and modify. As a result, the ancestral Unix diverged into a family of operating systems early on. Unix standards originally developed to reconcile the APIs of the different branches of the family tree.

The Unix standards that evolved after 1985 were quite successful at this—so much so that they serve as valuable documentation of the API of modern Unix implementations. In fact, real-world Unixes follow published standards so closely that developers can (and frequently do) lean more on documents like the POSIX specification than on the official manual pages for the Unix variant they happen to be using.

In fact, on the newer open-source Unixes (such as Linux), it is common for operating-system features to have been engineered using published standards as the specification. We’ll return to this point when we examine the RFC standards process later in this chapter.


#### 17.2.1 Standards and the Unix Wars
The original motivation for the development of Unix standards was the split between the AT&T and Berkeley lines of development that we examined in Chapter 2.

The 4.x BSD Unixes were descended from the 1979 Version 7. After the release of 4.1BSD in 1980 the BSD line quickly developed a reputation as the cutting edge of Unix. Important additions included the vi visual editor, job control facilities for managing multiple foreground and background tasks from a single console, and improvements in signals (see Chapter 7). By far the most important addition was to be TCP/IP networking, but though Berkeley got the contract to do it in 1980, TCP/IP was not to ship in an external release for three years.

But another version, 1981’s System III, became the basis of AT&T’s later development. System III reworked the Version 7 terminals interface into a cleaner and more elegant form that was completely incompatible with the Berkeley enhancements. It retained the older (non-resetting) semantics of signals (again, see Chapter 7 for discussion of this point). The January 1983 release of System V Release 1 incorporated some BSD utilities (such as vi(1)).

The first attempt to bridge the gap came in February 1983 from UniForum, an influential Unix user group. Their Uniforum 1983 Draft Standard (UDS 83) described a “core Unix System” consisting of a subset of the System III kernel and libraries plus a file-locking primitive. AT&T declared support for UDS 83, but the standard was an inadequate subset of evolving practice based on 4.1BSD. The problem was exacerbated by the July 1983 release of 4.2BSD, which added many new features (including TCP/IP networking) and introduced some subtle incompatibilities with the ancestral Version 7.

The 1984 divestiture of the Bell operating companies and the beginnings of the Unix wars (see Chapter 2) significantly complicated matters. Sun Microsystems was leading the workstation industry in a BSD direction; AT&T was trying to get into the computer business and use control of Unix as a strategic weapon even as it continued to license the operating system to competitors like Sun. All the vendors were making business decisions to differentiate their versions of Unix for competitive advantage.

During the Unix wars, technical standardization became something that cooperating technical people pushed for and most product managers accepted grudgingly or actively resisted. The one large and important exception was AT&T, which declared its intention to cooperate with user groups in setting standards when it announced System V Release 2 (SVr2) in January 1984. The second revision of the UniForum Draft Standard, in 1984, both tracked and influenced the API of SVr2. Later Unix standards also tended to track System V except in areas where BSD facilities were clearly functionally superior (thus, for example, modern Unix standards describe the System V terminal controls rather than the BSD interface to the same facilities).

In 1985, AT&T released the System V Interface Definition (SVID). SVID provided a more formal description of the SVr2 API, incorporating UDS 84. Later revisions SVID2 and SVID3 tracked the interfaces of System V releases 3 and 4. SVID became the basis for the POSIX standards, which ultimately tipped most of the Berkeley/AT&T disputes over system and C library calls in AT&T’s favor.

But this would not become obvious for a few years yet; meanwhile, the Unix wars raged on. For example, 1985 saw the release of two competing API standards for file system sharing over networks: Sun’s Network File System (NFS) and AT&T’s Remote File System (RFS). Sun’s NFS prevailed because Sun was willing to share not merely specifications but open-source code with others.

The lesson of this success should have been all the more pointed because on purely logical grounds RFS was the superior model. It supported better file-locking semantics and better mapping among user identities on different systems, and generally made an effort to get the finer details of Unix file system semantics precisely right, unlike NFS. The lesson was ignored, however, even when it was repeated in 1987 by the open-source X windowing system’s victory over Sun’s proprietary Networked Window System (NeWS).

After 1985 the main thrust of Unix standardization passed to the Institute of Electrical and Electronic Engineers (IEEE). The IEEE’s 1003 committee developed a series of standards generally known as POSIX.4 These went beyond describing merely systems calls and C library facilities; they specified detailed semantics of a shell and a minimum command set, and also detailed bindings for various non-C programming languages. The first release in 1990 was followed by a second edition in 1996. The International Standards Organization adopted them as ISO/IEC 9945.

4 The original 1986 trial-use standard was called IEEE-IX. The name ’POSIX’ was suggested by Richard Stallman. The introduction to POSIX.1 says: “It is expected to be pronounced pahz-icks as in positive, not poh-six, or other variations. The pronounciation has been published in an attempt to promulgate a standardized way of referring to a standard operating system interface”.

Key POSIX standards include the following:

1003.1 (released 1990)

Library procedures. Described the C system call API, much like Version 7 except for signals and the terminal-control interface.

1003.2 (released 1992)

Standard shell and utilities. Shell semantics strongly resemble those of the System V Bourne shell.

1003.4 (released 1993)

Real-time Unix. Binary semaphores, process memory locking, memory-mapped files, shared memory, priority scheduling, real-time signals, clocks and timers, IPC message passing, synchronized I/O, asynchronous I/O, real-time files.

In the 1996 Second Edition, 1003.4 was split into 1003.1b (real-time) and 1003.1c (threads).

Despite being underspecified in a couple of key areas such as signal-handling semantics and omitting BSD sockets, the original POSIX standards became the basis of all later Unix standardization work. They are still cited as an authority, albeit indirectly through references like POSIX Programmer’s Guide [Lewine]. The de facto Unix API standard is still “POSIX plus sockets”, with later standards mainly adding features and specifying conformance in unusual edge cases more closely.

The next player on the scene was X/Open (later renamed the Open Group), a consortium of Unix vendors formed in 1984. Their X/Open Portability Guides (XPGs) initially developed in parallel with the POSIX drafts, then after 1990 the XPGs incorporated and extended POSIX. Unlike POSIX, which attempted to capture a safe subset of all Unixes, the XPGs were oriented more toward common practice at the leading edge; even XPG1 in 1985, spanning SVr2 and 4.2BSD,  included sockets.

XPG2 in 1987 added a terminal-handling API that was essentially System V curses(3). XPG3 in 1990 merged in the X11 API. XPG4 in 1992 mandated full compliance with the 1989 ANSI C standard. XPG2, 3, and 4 were heavily concerned with support of internationalization and described an elaborate API for handling codesets and message catalogs.

In reading about Unix standards you might come across references to “Spec 1170” (from 1993), “Unix 95” (from 1995) and “Unix 98” (from 1998). These were certification marks based on the X/Open standards; they are now of historical interest only. But the work done on XPG4 turned into Spec 1170, which turned into the first version of the Single Unix Specification (SUS).

In 1993 seventy-five systems and software vendors including every major Unix company put a final end to the Unix wars when they declared backing for X/Open to develop a common definition of Unix. As part of the arrangement, X/Open acquired the rights to the Unix trademark. The merged standard became Single Unix Standard version 1. It was followed in 1997 by a version 2. In 1999 X/Open absorbed the POSIX activity.

In 2001, X/Open (now The Open Group) issued the Single Unix Standard version 3 <http://www.unix.org/version3/>. All the threads of Unix API standardization were finally gathered into one bundle. This reflected facts on the ground; the different varieties of Unix had re-converged on a common API. And, at least among old-timers who remembered the turbulence of the 1980s, there was much rejoicing.


#### 17.2.2 The Ghost at the Victory Banquet
There was, unfortunately, an awkward detail—the old-school Unix vendors who had backed the effort were under severe pressure from the new school of open-source Unixes, and were in some cases in the process of abandoning (in favor of Linux) the proprietary Unixes for which they had gone to so much effort to secure conformance.

The conformance testing needed to verify Single Unix Specification conformance is an expensive proposition. It would need to be done on a per-distribution basis, but is well out of the reach of most distributors of open-source operating systems. In any case, Linux changes so fast that any given release of a distribution would probably be obsolete by the time it could get certified.5

5 One Linux distributor, Lasermoon in Great Britain, did achieve POSIX.1 FIPS 151–2 certification—and went out of business, because potential customers didn’t care.

Standards like the Single Unix Specification have not entirely lost their relevance. They’re still valuable guides for Unix implementers. But how The Open Group and other institutions of the old-school Unix standardization process will adapt to the rapid tempo of open-source releases (and to the low- or zero-budget operation of open-source development groups!) remains to be seen.


#### 17.2.3 Unix Standards in the Open-Source World
In the mid-1990s, the open-source community began standardization efforts of its own. These efforts built on the source-code-level compatibility secured by POSIX and its descendants. Linux, in particular, had been written from scratch in a way that depended on the availability of Unix API standards like POSIX.6

6 See Just for Fun [Torvalds] for discussion.

In 1998 Oracle ported its market-leading database product to Linux, in a move that was rightly seen as a major breakthrough in Linux’s mainstream acceptance. The engineer in charge of the port provided a definitive demonstration that API standards had done their job when he was asked by a reporter what technical challenges Oracle had had to surmount. The engineer’s reply was “We typed ’make’.”

The problem for the new-school Unixes, therefore, was not API compatibility at the source-code level. Everybody took for granted the ability to move source code between different Linux, BSD, and proprietary-Unix distributions without more than a trivial amount of porting labor. The new problem was not source compatibility but binary compatibility. For the ground under Unix had shifted in a subtle way as a consequence of the triumph of commodity PC hardware.

In the old days, each Unix had run on what was effectively its own hardware platform. There was enough variety in processor instruction sets and machine architectures that applications had to be ported at source level to move at all. On the other hand, there were a relatively few major Unix releases, each with relatively long service lifetimes. Application vendors like Oracle could afford the cost of building and shipping separate binary distributions for each of three or four hardware/software combinations, because they could amortize the low cost of source-code porting over large customer populations and a long enough product life cycle.

But then the minicomputer and workstation vendors were swamped by inexpensive 386-based supermicros, and open-source Unixes changed the rules. Vendors found they no longer had a stable platform to ship their binaries to.

The superficial problem, at first, was the large number of Unix distributors—but as the Linux distribution market consolidated, it became clear that the real issue was the rate of change over time. APIs were stable, but the expected locations of system administrative files, utility programs, and things like the prefix of the paths to user mailbox names and system log files kept changing.

The first standards effort to develop within the new-school Linux and BSD community itself (beginning in 1993) was the Filesystem Hierarchy Standard (FHS). This was incorporated into the Linux Standards Base (LSB), which also standardized an expected set of service libraries and helper applications. Both standards became activities of the Free Standards Group <http://www.freestandards.org/>, which by 2001 developed a role similar to X/Open’s position amidst the old-school Unix vendors.


### 17.3 IETF and the RFC Standards Process
When the Unix community merged with the culture of Internet engineers, it also inherited a mindset formed by the RFC standards process of the Internet Engineering Task Force (IETF). In IETF tradition, standards have to arise from experience with a working prototype implementation—but once they become standards, code that does not conform to them is considered broken and mercilessly scrapped.

This is not, sadly, the way standards are normally developed. The history of computing is full of instances in which technical standards were derived by a process that combined the worst features of philosophical axe-grinding with murky back-room politics—producing specifications that failed to resemble anything ever implemented. Worse, many were either so demanding that they could not be practically implemented or so underspecified that they caused more confusion than they resolved. Then they were promulgated to vendors who ignored them wherever they were inconvenient.

One of the more notorious examples of standards nonsense was the Open Systems Interconnect networking protocols that briefly contended with TCP/IP in the 1980s—its 7-layer model looked elegant from a distance but proved overcomplicated and unimplementable in practice.7 The ANSI X3.64 standard for video-display terminal capabilities is another famous horror story; bedeviled by subtle incompatibilities between legally conformant implementations. Even after character-cell terminals have been largely displaced by bitmapped displays these continue to cause problems (in particular, this is why the function and special keys in your xterm(1) will occasionally break). The RS232 standard for serial communications was so underspecified that it sometimes seemed that no two serial cables were alike. Standards horror stories of similar kind could fill a book the size of this one.

7 A Web search is likely to turn up a popular page comparing the OSI 7-layer model with the Taco Bell 7-layer burrito—unfavorably to the former.

The IETF’s philosophy has been famously summarized as “We reject kings, presidents, and voting. We believe in rough consensus and running code”.8 That demand for a working implementation first has saved it from the worst category of blunders. In fact its criterion is stronger:

8 This line was first uttered by senior IETF cadre Dave Clark at the tumultuous 1992 meeting during which the IETF rejected the Open Systems Interconnect protocol.

[A] candidate specification must be implemented and tested for correct operation and interoperability by multiple independent parties and utilized in increasingly demanding environments, before it can be adopted as an Internet Standard.

—The Internet Standards Process—Revision 3 (RFC 2026)

All IETF standards pass through a stage as RFCs (Requests for Comment). The submission process for RFCs is deliberately informal. RFCs may propose standards, survey results, suggest philosophical bases for subsequent RFCs, or even make jokes. The appearance of the annual April 1st RFC is the closest equivalent of a high holy day observance among Internet hackers, and has produced such gems as A Standard for the Transmission of IP Datagrams on Avian Carriers (RFC 1149)9 the The Hyper Text Coffee Pot Control Protocol (RFC 2324),10 and The Security Flag in the IPv4 Header (RFC 3514).11

9 RFC 1149 is available on the Web <http://www.ietf.org/rfc/rfc1149.txt>. Not only that, it has been implemented <http://www.blug.linux.no/rfc1149/writeup.html>.

10 RFC 2324 is available on the Web <http://www.ietf.org/rfc/rfc2324.txt>.

11 RFC 3514 is available on the Web <http://www.ietf.org/rfc/rfc3514.txt>.

But joke RFCs are about the only sort of submission that instantly becomes an RFC. Serious proposals actually start as “Internet-Drafts” floated for public comment via IETF directories on several well-known hosts. Individual Internet-Drafts have no formal status and can be changed or dropped by their originators at any time. If they are neither withdrawn nor promoted to RFC status, they are removed after six months.

Internet-Drafts are not specifications, and software implementers and vendors are specifically barred from claiming compliance with them as if they were specifications. Internet-Drafts are focal points for discussion, usually in a working group connected through an electronic mailing list. When the working group leadership deems fit, the Internet-Draft is submitted to the RFC editor for assignment of an RFC number.

Once an Internet-Draft has been published with an RFC number, it is a specification to which implementers may claim conformance. It is expected that the authors of the RFC and the community at large will begin correcting the specification with field experience.

Some RFCs go no further. A specification that fails to attract use and survive field testing can be quietly forgotten, and eventually marked “Not recommended” or “Superseded” by the RFC editor. Failed proposals are accepted as one of the overheads of the process, and no stigma is attached to being associated with one.

The steering committee of the IETF (IESG, or Internet Engineering Steering Group) is responsible for putting successful RFCs on the standards track. They do this by designating the RFC a ’Proposed Standard’. For the RFC to qualify, the specification must be stable, peer-reviewed, and have attracted significant interest from the Internet community. Implementation experience is not absolutely required before an RFC is given Proposed Standard designation, but it is considered highly desirable, and the IESG may require it if the RFC touches the Internet core protocols or might be otherwise destabilizing.

Proposed Standards are still subject to revision, and may even be withdrawn if the IESG and IETF identify a better solution. They are not recommended for use in “disruption-sensitive environments”—don’t put them in your air-traffic-control systems or on intensive-care equipment.

When there are at least two working, complete, independently originated, and interoperable implementations of a Proposed Standard, the IESG may elevate it to Draft Standard status. RFC 2026 says: “Elevation to Draft Standard is a major advance in status, indicating a strong belief that the specification is mature and will be useful”.

Once an RFC has reached Draft Standard status, it will be changed only to address bugs in the logic of the specification. Draft Standards are expected to be ready for deployment in disruption-sensitive environments.

When a Draft Standard has passed the test of widespread implementation and reached general acceptance, it may be blessed as an Internet Standard. Internet Standards keep their RFC numbers, but also get a number in the STD series. At time of writing there are over 3000 RFCs but only 60 STDs.

RFCs not on standards track may be labeled Experimental, Informational (the joke RFCs get this label), or Historic. The Historic label is applied to obsolete standards. RFC 2026 notes: “(Purists have suggested that the word should be ’Historical’; however, at this point, the use of ’Historic’ is historical.)”

The IETF standards process is designed to encourage standardization driven by practice rather than theory, and to ensure that standard protocols have undergone rigorous peer review and testing. The success of this model is evident in its results—the worldwide Internet.


### 17.4 Specifications as DNA, Code as RNA
Even in the paleolithic period of the PDP-7, Unix programmers had always been more prone than their counterparts elsewhere to treat old code as disposable. This was doubtless a product of the Unix tradition’s emphasis on modularity, which makes it easier to discard and replace small pieces of systems without losing everything. Unix programmers have learned by experience that trying to salvage bad code or a bad design is often more work than rebooting the project. Where in other programming cultures the instinct would be to patch the monster monolith because you have so much work invested in it, the Unix instinct is usually to scrap and rebuild.

The IETF tradition reinforced this by teaching us to think of code as secondary to standards. Standards are what enable programs to cooperate; they knit our technologies into wholes that are more than the sum of the parts. The IETF showed us that careful standardization, aimed at capturing the best of existing practice, is a powerful form of humility that achieves more than grandiose attempts to remake the world around a never-implemented ideal.

After 1980, the impact of that lesson was increasingly widely felt in the Unix community. Thus, while the ANSI/ISO C standard from 1989 is not completely without flaws, it is exceptionally clean and practical for a standard of its size and importance. The Single Unix Specification contains fossils from three decades of experimentation and false starts in a more complicated domain, and is therefore messier than ANSI C. But the component standards it was composed from are quite good; strong evidence for this is the fact that Linus Torvalds successfully built a Unix from scratch by reading them. The IETF’s quiet but powerful example created one of the critical pieces of context that made Linus Torvalds’s feat possible.

Respect for published standards and the IETF process has become deeply ingrained in the Unix culture; deliberately violating Internet STDs is simply Not Done. This can sometimes create chasms of mutual incomprehension between people with a Unix background and others prone to assume that the most popular or widely deployed implementation of a protocol is by definition correct—even if it breaks the standard so severely that it will not interoperate with properly conforming software.

The Unix programmer’s respect for published standards is more interesting because he is likely to be rather hostile to a-priori specifications of other kinds. By the time the ’waterfall model’ (specify exhaustively first, then implement, then debug, with no reverse motion at any stage) fell out of favor in the software-engineering literature, it had been an object of derision among Unix programmers for years. Experience, and a strong tradition of collaborative development, had already taught them that prototyping and repeated cycles of test and evolution are a better way.

The Unix tradition clearly recognizes that there can be great value in good specifications, but it demands that they be treated as provisional and subject to revision through field experience in the way that Internet-Drafts and Proposed Standards are. In best Unix practice, the documentation of the program is used as a specification subject to revision analogously to an Internet Proposed Standard.

Unlike other environments, in Unix development the documentation is often written before the program, or at least in conjunction with it. For X11, the core X standards were finished before the first release of X and have remained essentially unchanged since that date. Compatibility among different X systems is improved further by rigorous specification-driven testing.

The existence of a well-written specification made the development of the X test suite much easier. Each statement in the X specification was translated into code to test the implementation, a few minor inconsistencies were uncovered in the specification during this process, but the result is a test suite that covers a significant fraction of the code paths within the sample X library and server, and all without referring to the source code of that implementation.

—Keith Packard

Semiautomation of the test-suite generation proved to be a major advantage. While field experience and advances in the state of the graphics art led many to criticize X on design grounds, and various portions of it (such as the security and user-resource models) came to seem clumsy and over-engineered, the X implementation achieved a remarkable level of stability and cross-vendor interoperation.

In Chapter 9 we discussed the value of pushing coding up to the highest possible level to minimize the effects of constant defect density. Implicit in Keith Packard’s account is the idea that the X documentation constituted no mere wish-list but a form of high-level code. Another key X developer confirms this:

In X, the specification has always ruled. Sometimes specs have bugs that need to be fixed too, but code is usually buggier than specs (for any spec worth its ink, anyway).

—Jim Gettys

Jim goes on to observe that X’s process is actually quite similar to the IETF’s. Nor is its utility limited to constructing good test suites; it means that arguments about the system’s behavior can be conducted at a functional level with respect to the specification, avoiding too much entanglement in implementation issues.

Having a well-considered specification driving development allows for little argument about bug vs. feature; a system which incorrectly implements the specification is broken and should be fixed.

I suspect this is so ingrained into most of us that we lose sight of its power.

A friend of mine who worked for a small software firm east of Bellevue wondered how Linux applications developers could get OS changes synchronized with application releases. In that company, major system-level APIs change frequently to accommodate application whims and so essential OS functionality must often be released along with each application.

I described the power held by the specifications and how the implementation was subservient to them, and then went on to assert that an application which got an unexpected result from a documented interface was either broken or had discovered a bug. He found this concept startling.

Discerning such bugs is a simple matter of verifying the implementation of the interface against the specification. Of course, having source for the implementation makes that a bit easier.

—Keith Packard

This standards-come-first attitude has benefits for end users as well. While that no-longer-small company east of Bellevue has trouble keeping its office suite compatible with its own previous releases, GUI applications written for X11 in 1988 still run without change on today’s X implementations. In the Unix world, this sort of longevity is normal—and the standards-as-DNA attitude is the reason why.

Thus, experience shows that the standards-respecting, scrap-and-rebuild culture of Unix tends to yield better interoperability over extended time than perpetual patching of a code base without a standard to provide guidance and continuity. This may, indeed, be one of the most important Unix lessons.

Keith’s last comment brings us directly to an issue that the success of open-source Unixes has brought to the forefront—the relationship between open standards and open source. We’ll address this at the end of the chapter—but before doing that, it’s time to address the practical question of how Unix programmers can actually use the tremendous body of accumulated standards and lore to achieve software portability.


### 17.5 Programming for Portability
Software portability is usually thought of in quasi-spatial terms: can this code be moved sideways to existing hardware and software platforms other than the one it was built for? But Unix experience over decades tells us that durability down through time is just as important, if not more so. If we could predict the future of software in detail it would probably be the present—nevertheless, in programming for portability we should try to think about making choices that will base the software on the features of its environment that are likeliest to persist, and avoid technologies that seem likely to face end-of-life in the foreseeable future.

Under Unix, two decades of attention to the issues of specifying portable APIs has largely solved that problem. Facilities described in the Single Unix Specification are likely to be present on all modern Unix platforms today and rather unlikely to go unsupported in the future.

But not all platform dependencies have to do with the system or library APIs. Your implementation language can matter; file-system layout and configuration differences between the source and target system can be a problem as well. But Unix practice has evolved ways to cope.


#### 17.5.1 Portability and Choice of Language
The first issue in programming for portability is your choice of implementation language. All the major languages we surveyed in Chapter 14 are highly portable in the sense that compatible implementations are available across all modern Unixes; for most, implementations under Windows and MacOS are available as well. Portability problems tend to arise not in the core languages but in support libraries and degree of integration with the local environment (especially IPC and concurrent-process management, including the infrastructure for GUIs).


#### 17.5.1.1 C Portability
The core C language is extremely portable. The standard Unix implementation is the GNU C compiler, which is ubiquitous not only in open-source Unixes but modern proprietary Unixes as well. GNU C has been ported to Windows and classic MacOS, but is not widely used in either environment because it lacks portable bindings to the native GUI.

The standard I/O library, mathematics routines, and internationalization support are portable across all C implementations. File I/O, signals, and process control are portable across Unixes provided one takes care to use only the modern APIs described in the Single Unix Specification; older C code often has thickets of preprocessor conditionals for portability, but those handle legacy pre-POSIX interfaces from older proprietary Unixes that are obsolete or close to it in 2003.

C portability starts to be a more serious problem near IPC, threads, and GUI interfaces. We discussed IPC and threads portability issues in Chapter 7. The real practical problem is GUI toolkits. A number of open-source GUI toolkits are universally portable across modern Unixes and to Windows and classic MacOS as well—Tk, wxWindows, GTK, and Qt are four well-known ones with source code and documentation readily discoverable by Web search. But none of them is shipped with all platforms, and (for reasons more legal than technical) none of these offers the native-GUI look and feel on all platforms. We gave some guidelines for coping in Chapter 15.

Volumes have been written on the subject of how to write portable C code. This book is not going to be one of them. Instead, we recommend a careful reading of Recommended C Style and Coding Standards [Cannon] and the chapter on portability in The Practice of Programming [Kernighan-Pike99].


#### 17.5.1.2 C++ Portability
C++ has all the same operating-system-level portability issues as C, and some of its own. An additional one is that the open-source GNU compiler for C++ has lagged substantially behind the proprietary implementations for most of its existence; thus, there is not yet as of mid-2003 a universally deployed equivalent of GNU C on which to base a de-facto standard. Furthermore, no C++ compiler yet implements the full C++99 ISO standard for the language, though GNU C++ comes closest.


#### 17.5.1.3 Shell Portability
Shell-script portability is, unfortunately, poor. The problem is not shell itself; bash(1) (the open-source Bourne Again shell) has become sufficiently ubiquitous that pure shellscripts can run almost anywhere. The problem is that most shellscripts make heavy use of other commands and filters that are much less portable, and by no means guaranteed to be in the toolkit in any given target machine.

This problem can be overcome by dint of heroic effort, as in the autoconf(1) tools. But it is sufficiently severe that most of the heavier sort of programming that used to be done in shell has moved to second-generation scripting languages like Perl, Python, and Tcl.


#### 17.5.1.4 Perl Portability
Perl has good portability. Stock Perl even offers a portable set of bindings to the Tk toolkit that supports portable GUIs across Unix, MacOS and Windows. One issue dogs it, however. Perl scripts often require add-on libraries from CPAN (the Comprehensive Perl Archive Network) which are not guaranteed to be present with every Perl implementation.


#### 17.5.1.5 Python Portability
Python has excellent portability. Like Perl, stock Python even offers a portable set of bindings to the Tk toolkit that supports portable GUIs across Unix, MacOS, and Windows.

Stock Python has a much richer standard library than does Perl and no equivalent of CPAN for programmers to rely on; instead, important extension modules are routinely incorporated into the stock Python distribution during minor releases. This trades a spatial problem for a temporal one, making Python much less subject to the missing-module effect at the cost of making Python minor version numbers somewhat more important than Perl release levels are. In practice, the tradeoff seems to favor Python.


#### 17.5.1.6 Tcl Portability
Tcl portability is good, overall, but varies sharply by project complexity. The Tk toolkit for cross-platform GUI programming is native to Tcl. As with Python, evolution of the core language has been relatively smooth, with few version-skew problems. Unfortunately, Tcl relies even more heavily than Perl on extension facilities that are not guaranteed to ship with every implementation—and there is no equivalent of CPAN to centrally distribute them.

For smaller projects not reliant on extensions, therefore, Tcl portability is excellent. But larger projects tend to depend heavily on both extensions and (as with shell programming) calling external commands that may or may not be present on the target machine; their portability tends to be poor.

Tcl may have suffered, ironically, from the ease of adding extensions to it. By the time a particular extension started to look interesting as part of the standard distribution, there typically were several different versions of it in existence. At the 1995 Tcl/Tk Workshop, John Ousterhout explained why there was no OO support in the standard Tcl distribution:

Think of five mullahs sitting around in a circle, all saying “Kill him, he’s a heathen”. If I put a specific OO scheme into the core, then one of them will say “Bless you, my son, you may kiss my ring”, and the other four will say “Kill him, he’s a heathen”.

The lot of a language designer is not necessarily a happy one.


#### 17.5.1.7 Java Portability
Java portability is excellent—it was, after all, designed with “write once, run everywhere” as a primary goal. Portability fails, however, to be perfect. The difficulties are mostly version-skew problems between JDK 1.1 and the older AWT GUI toolkit (on the one hand) and JDK 1.2 with the newer Swing GUI toolkit. There are several important reasons for these:

• Sun’s AWT design was so deficient that it had to be replaced with Swing.

• Microsoft’s refusal to support Java development on Windows and attempt to replace it with C#.

• Microsoft’s decision to hold Internet Explorer’s applet support at the JDK 1.1 level.

• Sun licensing terms that make open-source implementations of JDK 1.2 impossible, retarding its deployment (especially in the Linux world).

For programs that involve GUIs, Java developers seeking portability will, for the foreseeable future, face a choice: Stay in JDK 1.1/AWT with a poorly designed toolkit for maximum portability (including to Microsoft Windows), or get the better toolkit and capabilities of JDK 1.2 at the cost of sacrificing some portability.

Finally, as we noted previously, the Java thread support has portability problems. The Java API, unlike less ambitious operating-system bindings for other languages, bravely tried to bridge the gaps between the diverging process models offered by different operating systems. It does not quite manage the trick.


#### 17.5.1.8 Emacs Lisp Portability
Emacs Lisp portability is excellent. Emacs installations tend to be upgraded frequently, so seriously out-of-date environments are rare. The same extension Lisp is supported everywhere and effectively all extensions are shipped with Emacs itself.

Then, too, the primitive set of Emacs is quite stable. It achieved completeness for the things an editor has to do (manipulating buffers, bashing text) years ago. Only the introduction of X has disturbed this picture at all, and very few Emacs modes need to be aware of X. Portability problems are usually manifestations of quirks in the C-level bindings of operating-system facilities; control of subordinate processes in modes like mail agents is about the only issue where such problems manifest with any frequency.


#### 17.5.2 Avoiding System Dependencies
Once your language and support libraries are chosen, the next portability issue is usually the location of key system files and directories: mail spools, logfile directories and the like. The archetype of this sort of problem is whether the mail spool directory is /var/spool/mail or /var/mail.

Often, you can avoid this sort of dependency by stepping back and reframing the problem. Why are you opening a file in the mail spool directory, anyway? If you’re writing to it, wouldn’t it be better to simply invoke the local mail transport agent to do it for you so the file-locking gets done right? If you’re reading from it, might it be better to query it through a POP3 or IMAP server?

The same sort of question applies elsewhere. If you find yourself opening logfiles manually, shouldn’t you be using syslog(3) instead? Function-call interfaces through the C library are better standardized than system file locations. Use that fact!

If you must have system file locations in your code, your best alternative depends on whether you will be distributing in source code or binary form. If you are distributing in source, the autoconf tools we discuss in the next section will help you. If you’re distributing in binary, then it’s good practice to have your program poke around at runtime and see if it can automatically adapt itself to local conditions—say, by actually checking for the existence of /var/mail and /var/spool/mail.


#### 17.5.3 Tools for Portability
You can often use the open-source GNU autoconf(1) we surveyed in Chapter 15 to handle portability issues, do system-configuration probes, and tailor your makefiles. People building from sources today expect to be able to type configure; make; make install and get a clean build. There is a good tutorial on these tools <http://seul.org/docs/autotut/>. Even if you’re distributing in binary, the autoconf(1) tools can help automate away the problem of conditionalizing your code for different platforms.

Other tools that address this problem; two of the better known are the Imake(1) tool associated with the X windowing system and the Configure tool built by Larry Wall (later the inventor of Perl) and adapted for many different projects. All are at least as complicated as the autoconf suite, and no longer as often used. They don’t cover as wide a range of target systems.


### 17.6 Internationalization
An in-depth discussion of code internationalization—designing software so the interface readily incorporates multiple languages and the vagaries of different character sets—would be out of scope for this book. However, a few lessons for good practice do stand out from Unix experience.

First, separate the message base from the code. Good Unix practice is to separate the message strings a program uses from its code. so that message dictionaries in other languages can be plugged in without modifying the code.

The best-known tool for this job is GNU gettext, which requires that you wrap native-language strings that need to be internationalized in a special macro. The macro uses each string as a key into per-language dictionaries which can be supplied as separate files. If no such dictionaries are available (or if they are but the string lookup does not return a match), the macro simply returns its argument, implicitly falling back on the native language in the code.

While gettext itself is messy and fragile as of mid-2003, its general philosophy is sound. For many projects, it is possible to craft a lighter-weight version of this idea with good results.

Second, there is a clear trend in modern Unixes to scrap all the historical cruft associated with multiple character sets and make applications natively speak UTF-8, the 8-bit shift encoding of the Unicode character set (as opposed to, say, making them natively speak 16-bit wide characters). The low 128 characters of UTF-8 are ASCII, and the low 256 are Latin-1, which means this choice is backward-compatible with the two most widely used character sets. The fact that XML and Java have made this choice helps, but the momentum is present even where XML and Java are not.

Third, beware of character ranges in regular expressions. The element [a-z] will not necessarily catch all lower-case letters if the script or program it’s in is applied to (say) German, where the sharp-s or ß character is considered lower-case but does not fall in that range; similar problems arise with French accented letters. Its safer to use [[:lower:]]. and other symbolic ranges described in the POSIX standard.


### 17.7 Portability, Open Standards, and Open Source
Portability requires standards. Open-source reference implementations are the most effective method known for both promulgating a standard and for pressuring proprietary vendors into conforming. If you are a developer, open-source implementations of a published standard can both tremendously reduce your coding workload and allow your product to benefit (in ways both expected and unexpected) from the labor of others.

Let’s suppose, for example, you are designing image-capture software for a digital camera. Why write your own format for saving image bits or buy proprietary code when (as we noted in Chapter 5) there is a well-tested, full-featured library for writing PNGs in open source?

The (re)invention of open source has had a significant impact on the standards process as well. Though it is not formally a requirement, the IETF has since around 1997 grown increasingly resistant to standard-tracking RFCs that do not have at least one open-source reference implementation. In the future, it seems likely that conformance to any given standard will increasingly be measured by conformance to (or outright use of!) open-source implementations that have been blessed by the standard’s authors.

The flip side of this is that often the best way to make something a standard is to distribute a high-quality open-source implementation of it.

—Henry Spencer

In the end, the most effective step you can take to ensure the portability of your code is to not rely on proprietary technology. You never know when the closed-source library or tool or code generator or network protocol you are depending on will be end-of-lifed, or when the interface will be changed in some backwards-incompatible way that breaks your project. With open-source code, you have a path forward even if the leading-edge version changes in a way that breaks your project; because you have access to source code, you can forward-port it to new platforms if you need to.

Until the late 1990s this advice would have been impractical. The few alternatives to relying on proprietary operating systems and development tools were noble experiments, academic proofs-of-concept, or toys. But the Internet changed everything; in mid-2003 Linux and the other open-source Unixes exist and have proven their mettle as platforms for delivering production-quality software. Developers have a better option now than being dependent on short-term business decisions designed to protect someone else’s monopoly. Practice defensive design—build on open source and don’t get stranded!

## 18. Documentation: Explaining Your Code to a Web-Centric World

I’ve never met a human being who would want to read 17,000 pages of documentation, and if there was, I’d kill him to get him out of the gene pool.

—Joseph Costello

Unix’s first application, in 1971, was as a platform for document preparation—Bell Labs used it to prepare patent documents for filing. Computer-driven phototypesetting was still a novel idea then, and for years after it debuted in 1973 Joe Ossana’s troff(1) formatter defined the state of the art.

Ever since, sophisticated document formatters, typesetting software, and page-layout programs of various sorts have been an important theme in the Unix tradition. While troff(1) has proven surprisingly durable, Unix has also hosted a lot of groundbreaking work in this application area. Today, Unix developers and Unix tools are at the cutting edge of far-reaching changes in documentation practice triggered by the advent of the World Wide Web.

At the user-presentation level, Unix-community practice has been moving rapidly toward ’everything is HTML, all references are URLs’ since the mid-1990s. Increasingly, modern Unix help browsers are simply Web browsers that know how to parse certain specialized kinds of URLs (for example, ’man:ls(1)’ interprets the ls(1) man page into HTML). This relieves the problems created by having lots of different formats for documentation masters, but does not entirely solve them. Documentation composers still have to grapple with issues about which master format best meets their particular needs.

In this chapter, we’ll survey the rather unfortunate surfeit of different documentation formats and tools left behind by decades of experimentation, and we’ll develop guidelines for good practice and good style.


### 18.1 Documentation Concepts
Our first distinction is between “What You See Is What You Get” (WYSIWYG) documentation programs and markup-centered tools. Most desktop-publishing programs and word processors are in the former category; they have GUIs in which what one types is inserted directly into an on-screen presentation of the document intended to resemble the final printed version as closely as possible. In a markup-centered system, by contrast, the master document is normally flat text containing explicit, visible control tags and not at all resembling the intended output. The marked-up source can be modified with an ordinary text editor, but has to be fed to a formatter program to produce rendered output for printing or display.

The visual-interface, WYSIWYG style was too expensive for early computer hardware, and remained rare until the advent of the Macintosh personal computer in 1984. It is completely dominant on non-Unix operating systems today, Native Unix document tools, on the other hand, are almost all markup-centered. The Unix troff(1) of 1971 was a markup formatter, and is probably the oldest such program still in use.

Markup-centered tools still have a role because actual implementations of WYSIWYG tend to be broken in various ways—some superficial, some deep. WYSIWYG document processors have the general problem with GUIs that we discussed in Chapter 11; the fact that you can visually manipulate anything tends to mean you must visually manipulate everything. That would remain a problem even if the WYSIWIG correspondence between screen and printer output were perfect—but it almost never is.

In truth, WYSIWYG document processors aren’t exactly WYSIWIG. Most have interfaces that obscure the differences between screen presentation and printer output without actually eliminating them. Thus they violate the Rule of Least Surprise: the visual aspect of the interface encourages you to use the program like a typewriter even though it is not, and your input will occasionally produce an unexpected and undesired result.

In further truth, WYSIWIG systems actually rely on markup codes but expend great effort on keeping them invisible in normal use. Thus they break the Rule of Transparency: you can’t see all of the markup, so it is difficult to fix documents that break because of misplaced markup codes.

Despite its problems, WYSIWYG document processors can be very nice if what you want is to slide a picture three ems to the right on the cover of a four-page brochure. But they tend to be constricting any time you need to make a global change to the layout of a 300-page manuscript. WYSIWYG users faced with that kind of challenge must give it up or suffer the death of a thousand mouse clicks; in situations like that, there is really no substitute for being able to edit explicit markup, and Unix’s markup-centered document tools offer better solutions.

Today, in a world influenced by the example of the Web and XML, it has become common to make a distinction between presentation and structural markup in documents—the former being instructions about how a document should look, the latter being instructions about how it’s organized and what it means. This distinction wasn’t clearly understood or followed through in early Unix tools, but it’s important for understanding the design pressures that led to today’s descendants of them.

Presentation-level markup carries all the formatting information (e.g., about desired whitespace layout and font changes) in the document itself. In a structural-markup system, the document has to be combined with a stylesheet that tells the formatter how to translate the structure markup in the document to a physical layout. Both kinds of markup ultimately control the physical appearance of a printed or browsed document, but structural markup does it through one more level of indirection that turns out to be necessary if you want to produce good results for both printing and the Web.

Most markup-centered documentation systems support a macro facility. Macros are user-defined commands that are expanded by text substitution into sequences of built-in markup requests. Usually, these macros add structural features (like the ability to declare section headings) to the markup language.

The troff macro sets (mm, me, and my ms package) were actually designed to push people away from format-oriented editing and toward content-oriented editing. The idea was to label the semantic parts and then have different style packages that would know whether in this style the title should be boldfaced or not, centered or not, and so on. Thus there was at one point a set of macros that tried to imitate ACM style, and another that imitated Physical Review style, but used the basic -ms markup. All of the macros lost out to people who were focused on producing one document, and controlling its appearance, just as Web pages get bogged down in the dispute over whether the reader or author should control the appearance. I frequently found secretaries who were using the .AU (author name) command just to produce italics, noticing that it did that, and then getting into trouble with its other effects.

—Mike Lesk

Finally, we note that there are significant differences between the sorts of things composers want to do with small documents (business and personal letters, brochures, newsletters) and the things they want to do with large ones (books, long articles, technical papers, and manuals). Large documents tend to have more structure, to be pieced together from parts that may have to be changed separately, and to need automatically-generated features like tables of contents; these are both traits that favor markup-centered tools.


### 18.2 The Unix Style
The Unix style of documentation (and documentation tools) has several technical and cultural traits that set it apart from the way documentation is done elsewhere. Understanding these signature traits first will create context for you to understand why the programs and the practice look the way they do, and why the documentation reads the way it does.


#### 18.2.1 The Large-Document Bias
Unix documentation tools have always been designed primarily for the challenges involved in composing large and complex documents. Originally it was patent applications and paperwork; later it was scientific and technical papers, technical documentation of all sorts. Consequently, most Unix developers learned to love markup-centered documentation tools. Unlike the PC users of the time, the Unix culture was unimpressed with WYSIWYG word processors when they became generally available in the late 1980s and early 1990s—and even among today’s younger Unix hackers it is still unusual to find anyone who really prefers them.

Dislike of opaque binary document formats—and especially of opaque proprietary binary formats—also played a part in the rejection of WYSIWYG tools. On the other hand, Unix programmers seized on PostScript (the now-standard language for controlling imaging printers) with enthusiasm as soon as the language documentation became available; it fits neatly in the Unix tradition of domain-specific languages. Modern open-source Unix systems have excellent PostScript and Portable Document Format (PDF) tools.

Another consequence of this history is that Unix documentation tools have tended to have relatively weak support for including images, but strong support for diagrams, tables, graphing, and mathematical typesetting—the sorts of things often needed in technical papers.

The Unix attachment to markup-centered systems has often been caricatured as a prejudice or a troglodyte trait, but it is not really anything of the kind. Just as the putatively ’primitive’ CLI style of Unix is in many ways better adapted to the needs of power users than GUIs, the markup-centered design of tools like troff(1) is a better fit for the needs of power documenters than are WYSIWYG programs.

The large-document bias in Unix tradition did not just keep Unix developers attached to markup-based formatters like troff, it also made them interested in structural markup. The history of Unix document tools is one of lurching, muddled, and erratic movement in a general direction away from presentation markup and toward structural markup. In mid-2003 this journey is not yet over, but the end is distantly in sight.

The development of the World Wide Web meant that the ability to render documents in multiple media (or, at least, for both print and HTML display) became the central challenge for documentation tools after about 1993. At the same time, even ordinary users were, under the influence of HTML, becoming more comfortable with markup-centered systems. This led directly to an explosion of interest in structural markup and the invention of XML after 1996. Suddenly the old-time Unix attachment to markup-centered systems started looking prescient rather than reactionary.

Today, in mid-2003, most of the leading-edge development of XML-based documentation tools using structural markup is taking place under Unix. But, at the same time, the Unix culture has yet to let go of its older tradition of presentation-level markup systems. The creaking, clanking, armor-plated dinosaur that is troff has only partly been displaced by HTML and XML.


#### 18.2.2 Cultural Style
Most software documentation is written by technical writers for the least-common-denominator ignorant—the knowledgeable writing for the knowledgeless. The documentation that ships with Unix systems has traditionally been written by programmers for their peers. Even when it is not peer-to-peer documentation, it tends to be influenced in style and format by the enormous mass of programmer-to-programmer documentation that ships with Unix systems.

The difference this makes can be summed up in one observation: Unix manual pages traditionally have a section called BUGS. In other cultures, technical writers try to make the product look good by omitting and skating over known bugs. In the Unix culture, peers describe the known shortcomings of their software to each other in unsparing detail, and users consider a short but informative BUGS section to be an encouraging sign of quality work. Commercial Unix distributions that have broken this convention, either by suppressing the BUGS section or euphemizing it to a softer tag like LIMITATIONS or ISSUES or APPLICATION USAGE, have invariably fallen into decline.

Where most other software documentation tends to to oscillate between incomprehensibility and oversimplifying condescension, classic Unix documentation is written to be telegraphic but complete. It does not hold you by the hand, but it usually points in the right direction. The style assumes an active reader, one who is able to deduce obvious unsaid consequences of what is said, and who has the self-confidence to trust those deductions.

Unix programmers tend to be good at writing references, and most Unix documentation has the flavor of a reference or aide memoire for someone who thinks like the document-writer but is not yet an expert at his or her software. The results often look much more cryptic and sparse than they actually are. Read every word carefully, because whatever you want to know will probably be there, or deducible from what’s there. Read every word carefully, because you will seldom be told anything twice.


### 18.3 The Zoo of Unix Documentation Formats
All the major Unix documentation formats except the very newest one are presentation-level markups assisted by macro packages. We examine them here from oldest to newest.


#### 18.3.1 troff and the Documenter’s Workbench Tools
We discussed the Documenter’s Workbench architecture and tools in Chapter 8 as an example of how to integrate a system of multiple minilanguages. Now we return to these tools in their functional role as a typesetting system.

The troff formatter interprets a presentation-level markup language. Recent implementations like the GNU project’s groff(1) emit PostScript by default, though it is possible to get other forms of output by selecting a suitable driver. See Example 18.1 for several of the troff codes you might encounter in document sources.


Example 18.1. groff(1) markup example.

images

troff(1) has many other requests, but you are unlikely to see most of them directly. Very few documents are written in bare troff. It supports a macro facility, and half a dozen macro packages are in more or less general use. Of these, the overwhelmingly most common is the man(7) macro package used to write Unix manual pages. See Example 18.2 for a sample.


Example 18.2. man markup example.

images

Two of the other half-dozen historical troff macro libraries, ms(7) and mm(7) are still in use. BSD Unix has its own elaborate extended macro set, mdoc(7). All these are designed for writing technical manuals and long-form documentation. They are similar in style but more elaborate than man macros, and oriented toward producing typeset output.

A minor variant of troff(1) called nroff(1) produces output for devices that can only support constant-width fonts, like line printers and character-cell terminals. When you view a Unix manual page within a terminal window, it is nroff that has rendered it for you.

The Documenter’s Workbench tools do the technical-documentation jobs they were designed for quite well, which is why they have remained in continuous use for more than thirty years while computers increased a thousandfold in capacity. They produce typeset text of reasonable quality on imaging printers, and can throw a tolerable approximation of a formatted manual page on your screen.

They fall down badly in a couple of areas, however. Their stock selection of available fonts is limited. They don’t handle images well. It’s hard to get precise control of the positioning of text or images or diagrams within a page. Support for multilingual documents is nonexistent. There are numerous other problems, some chronic but minor and some absolute showstoppers for specific uses. But the most serious problem is that because so much of the markup is presentation level, it’s difficult to make good Web pages out of unmodified troff sources.

Nevertheless, at time of writing man pages remain the single most important form of Unix documentation.


#### 18.3.2 TEX
TEX (pronounced /teH/ with a rough h as though you are gargling) is a very capable typesetting program that, like the Emacs editor, originated outside the Unix culture but is now naturalized in it. It was created by noted computer scientist Donald Knuth when he became impatient with the quality of typography, and especially mathematical typesetting, that was available to him in the late 1970s.

TEX, like troff(1), is a markup-centered system. TEX’s request language is rather more powerful than troff’s; among other things, it is better at handling images, page-positioning content precisely, and internationalization. TEX is particularly good at mathematical typesetting, and unsurpassed at basic typesetting tasks like kerning, line filling, and hyphenating. TEX has become the standard submission format for most mathematical journals. It is actually now maintained as open source by a working group of the the American Mathematical Society. It is also commonly used for scientific papers.

As with troff(1), human beings usually do not write large volumes of raw TEX macros by hand; they use macro packages and various auxiliary programs instead. One particular macro package, LATEX, is almost universal, and most people who say they’re composing in TEX almost always actually mean they’re writing LATEX. Like troff’s macro packages, a lot of its requests are semistructural.

One important use of TEX that is normally hidden from the user is that other document-processing tools often generate LATEX to be turned into PostScript, rather than attempting the much more difficult job of generating PostScript themselves. The xmlto(1) front end that we discussed as a shell-programming case study in Chapter 14 uses this tactic; so does the XML-DocBook toolchain we’ll examine later in this chapter.

TEX has a wider application range than troff(1) and is in most ways a better design. It has the same fundamental problems as troff in an increasingly Web-centric world; its markup has strong ties to the presentation level, and automatically generating good Web pages from TEX sources is difficult and fault-prone.

TEX is never used for Unix system documentation and only rarely used for application documentation; for those purposes, troff is sufficient. But some software packages that originated in academia outside the Unix community have imported the use of TEX as a documentation master format; the Python language is one example. As we noted above, it is also heavily used for mathematical and scientific papers, and will probably dominate that niche for some years yet.


#### 18.3.3 Texinfo
Texinfo is a documentation markup invented by the Free Software Foundation and used mainly for GNU project documentation—including the documentation for such essential tools as Emacs and the GNU Compiler Collection.

Texinfo was the first markup system specifically designed to support both typeset output on paper and hypertext output for browsing. The hypertext format was not, however, HTML; it was a more primitive variety called ’info’, originally designed to be browsed from within Emacs. On the print side, Texinfo turns into TEX macros and can go from there to PostScript.

The Texinfo tools can now generate HTML. But they don’t do a very good or complete job, and because a lot of Texinfo’s markup is at presentation level it is doubtful that they ever will. As of mid-2003, the Free Software Foundation is working on heuristic Texinfo to DocBook translation. Texinfo will probably remain a live format for some time.


#### 18.3.4 POD
Plain Old Documentation is the markup system used by the maintainers of Perl. It generates manual pages, and has all the familiar problems of presentation-level markups, including trouble generating good HTML.


#### 18.3.5 HTML
Since the World Wide Web entered the mainstream in the early 1990s, a small but increasing percentage of Unix projects have been writing their documentation directly in HTML. The problem with this approach is that it is difficult to generate high-quality typeset output from HTML. There are particular problems with indexing as well; the information needed to generate indexes is not present in HTML.


#### 18.3.6 DocBook
DocBook is an SGML and XML document type definition designed for large, complex technical documents. It is alone among the markup formats used in the Unix community in being purely structural. The xmlto(1) tool discussed in Chapter 14 supports rendering to HTML, XHTML, PostScript, PDF, Windows Help markup, and several less important formats.

Several major open-source projects (including the Linux Documentation Project, FreeBSD, Apache, Samba, GNOME, and KDE) already use DocBook as a master format. This book was written in XML-DocBook.

DocBook is a large topic. We’ll return to it after summing up the problems with the current state of Unix documentation.


### 18.4 The Present Chaos and a Possible Way Out
Unix documentation is, at present, a mess.

Between man, ms, mm, TEX, Texinfo, POD, HTML, and DocBook, the documentation master files on modern Unix systems are scattered across eight different markup formats. There is no uniform way to view all the rendered versions. They aren’t Web-accessible, and they aren’t cross-indexed.

Many people in the Unix community are aware that this is a problem. At time of writing most of the effort toward solving it has come from open-source developers, who are more actively interested in competing for acceptance by nontechnical end users than developers for proprietary Unixes have been. Since 2000, practice has been moving toward use of XML-DocBook as a documentation interchange format.

The goal, which is within sight but will take a lot of effort to achieve, is to equip every Unix system with software that will act as a systemwide document registry. When system administrators install packages, one step will be to enter the package’s XML-DocBook documentation into the registry. It will then be rendered into a common HTML document tree and cross-linked to the documentation already present.

Early versions of the document-registry software are already working. The problem of forward-converting documentation from the other formats into XML-DocBook is a large and messy one, but the conversion tools are falling into place. Other political and technical problems remain to be attacked, but are probably solvable. While there is not as of mid-2003 a communitywide consensus that the older formats have to be phased out, that seems the likeliest working out of events.

Accordingly, we’ll next take a very detailed look at DocBook and its toolchain. This description should be read as an introduction to XML under Unix, a pragmatic guide to practice and as a major case study. It’s a good example of how, in the context of the Unix community, cooperation between different project groups develops around shared standards.


### 18.5 DocBook
A great many major open-source projects are converging on DocBook as a standard format for their documentation. The advocates of XML-based markup seem to have won the theoretical argument against presentation-level and for structural-level markup, and an effective XML-DocBook toolchain is available in open source.

Nevertheless, a lot of confusion still surrounds DocBook and the programs that support it. Its devotees speak an argot that is dense and forbidding even by computer-science standards, slinging around acronyms that have no obvious relationship to the things you need to do to write markup and make HTML or PostScript from it. XML standards and technical papers are notoriously obscure. In the rest of this section, we’ll try to dispel the fog of jargon.


#### 18.5.1 Document Type Definitions
(Note: to keep the explanation simple, most of this section tells some lies, mainly by omitting a lot of history. Truthfulness will be fully restored in a following section.)

DocBook is a structural-level markup language. Specifically, it is a dialect of XML. A DocBook document is a piece of XML that uses XML tags for structural markup.

For a document formatter to apply a stylesheet to your document and make it look good, it needs to know things about the overall structure of your document. For example, in order to physically format chapter headers properly, it needs to know that a book manuscript normally consists of front matter, a sequence of chapters, and back matter. In order for it to know this sort of thing, you need to give it a Document Type Definition or DTD. The DTD tells your formatter what sorts of elements can be in the document structure, and in what order they can appear.

What we mean by calling DocBook a ’dialect’ of XML is actually that DocBook is a DTD—a rather large DTD, with somewhere around 400 tags in it.1

1 In XML-speak, what we have been calling a ’dialect’ is called an ’application’; we’ve avoided that usage, since it collides with another more common sense of the word.

Lurking behind DocBook is a kind of program called a validating parser. When you format a DocBook document, the first step is to pass it through a validating parser (the front end of the DocBook formatter). This program checks your document against the DocBook DTD to make sure you aren’t breaking any of the DTD’s structural rules (otherwise the back end of the formatter, the part that applies your stylesheet, might become quite confused).

The validating parser will either throw an error, giving you messages about places where the document structure is broken, or translate the document into a stream of XML elements and text that the parser back end combines with the information in your stylesheet to produce formatted output.

Figure 18.1 diagrams the whole process.


Figure 18.1. Processing structural documents.

image

The part of the diagram inside the dotted box is your formatting software, or toolchain. Besides the obvious and visible input to the formatter (the document source) you’ll need to keep the two hidden inputs of the formatter (DTD and stylesheet) in mind to understand what follows.


#### 18.5.2 Other DTDs
A brief digression into other DTDs may help clarify what parts of the previous section are specific to DocBook and what parts are general to all structural-markup languages.

TEI <http://www.tei-c.org/> (Text Encoding Initiative) is a large, elaborate DTD used primarily in academia for computer transcription of literary texts. TEI’s Unix-based toolchains use many of the same tools that are involved with DocBook, but with different stylesheets and (of course) a different DTD.

XHTML, the latest version of HTML, is also an XML application described by a DTD, which explains the family resemblance between XHTML and DocBook tags. The XHTML toolchain consists of Web browsers that can format HTML as flat ASCII, together with any of a number of ad-hoc HTML-to-print utilities.

Many other XML DTDs are maintained to help people exchange structured information in fields as diverse as bioinformatics and banking. You can look at a list of repositories <http://www.xml.com/pub/rg/DTD_Repositories> to get some idea of the variety available.


#### 18.5.3 The DocBook Toolchain
Normally, what you’ll do to make XHTML from your DocBook sources is use the xmlto(1) front end. Your commands will look like this:

images

In this example, you converted an XML-DocBook document named foo.xml with three top-level sections into an index page and two parts. Making one big page is just as easy:

images

Finally, here is how you make PostScript for printing:

images

To turn your documents into HTML or PostScript, you need an engine that can apply the combination of DocBook DTD and a suitable stylesheet to your document. Figure 18.2 illustrates how the open-source tools for doing this fit together.


Figure 18.2. Present-day XML-DocBook toolchain.

image

Parsing your document and applying the stylesheet transformation will be handled by one of three programs. The most likely one is xsltproc, the parser that ships with Red Hat Linux. The other possibilities are two Java programs, Saxon and Xalan.

It is relatively easy to generate high-quality XHTML from either DocBook; the fact that XHTML is simply another XML DTD helps a lot. Translation to HTML is done by applying a rather simple stylesheet, and that’s the end of the story. RTF is also simple to generate in this way, and from XHTML or RTF it’s easy to generate a flat ASCII text approximation in a pinch.

The awkward case is print. Generating high-quality printed output—which means, in practice, Adobe’s PDF (Portable Document Format)—is difficult. Doing it right requires algorithmically duplicating the delicate judgments of a human typesetter moving from content to presentation level.

So, first, a stylesheet translates DocBook’s structural markup into another dialect of XML—FO (Formatting Objects). FO markup is very much presentation-level; you can think of it as a sort of XML functional equivalent of troff. It has to be translated to PostScript for packaging in a PDF.

In the toolchain shipped with Red Hat Linux, this job is handled by a TEX macro package called PassiveTeX. It translates the formatting objects generated by xsltproc into Donald Knuth’s TEX language. TEX’s output, known as DVI (DeVice Independent) format, is then massaged into PDF.

If you think this bucket chain of XML to TEX macros to DVI to PDF sounds like an awkward kludge, you’re right. It clanks, it wheezes, and it has ugly warts. Fonts are a significant problem, since XML and TEX and PDF have very different models of how fonts work; also, handling internationalization and localization is a nightmare. About the only thing this code path has going for it is that it works.

The elegant way will be FOP, a direct FO-to-PostScript translator being developed by the Apache project. With FOP, the internationalization problem is, if not solved, at least well confined; XML tools handle Unicode all the way through to FOP. The mapping from Unicode glyphs to Postscript font is also strictly FOP’s problem. The only trouble with this approach is that it doesn’t work—yet. As of mid-2003, FOP is in an unfinished alpha state—usable, but with rough edges and missing features.

Figure 18.3 illustrates what the FOP toolchain looks like.


Figure 18.3. Future XML-DocBook toolchain with FOP.

image

FOP has competition. Another project called xsl-fo-proc aims to do the same things as FOP, but in C++ (and therefore both faster than Java and not relying on the Java environment). As of mid-2003, xsl-fo-proc is in an unfinished alpha state, not as far along as FOP.


#### 18.5.4 Migration Tools
The second biggest problem with DocBook is the effort needed to convert old-style presentation markup to DocBook markup. Human beings can usually parse the presentation of a document into logical structure automatically, because (for example) they can tell from context when an italic font means ’emphasis’ and when it means something else such as ’this is a foreign phrase’.

Somehow, in converting documents to DocBook, those sorts of distinctions need to be made explicit. Sometimes they’re present in the old markup; often they are not, and the missing structural information has to be either deduced by clever heuristics or added by a human.

Here is a summary of the state of conversion tools from various other formats. None of these do a completely perfect job; inspection and perhaps a bit of hand-editing by a human being will be needed after conversion.

GNU Texinfo

The Free Software Foundation intends to support DocBook as an interchange format. Texinfo has enough structure to make reasonably good automatic conversion possible (human editing is still needed afterwards, but not much of it), and the 4.x versions of makeinfo feature a --docbook switch that generates DocBook. More at the makeinfo project page <http://www.gnu.org/directory/texinfo.html>.

POD

A POD::DocBook <http://www.cpan.org/modules/by-module/Pod/> module translates Plain Old Documentation markup to DocBook. It claims to translate every POD tag except the L<> italic tag. The man page also says “Nested =over/=back lists are not supported within DocBook”, but notes that the module has been heavily tested.

LATEX

A project called TeX4ht <http://www.lrz-muenchen.de/services/software/sonstiges/tex4ht/mn.html> can, according to the author of PassiveTEX, generate DocBook from LATEX.

man pages and other troff-based markups

These are generally considered the biggest and nastiest conversion problems. And indeed, the basic troff(1) markup is at too low a presentation level for automatic conversion tools to do much of any good. However, the gloom in the picture lightens significantly if we consider translation from sources of documents written in macro packages like man(7). These have enough structural features for automatic translation to get some traction.

I wrote a tool to do troff-to-DocBook myself, because I couldn’t find anything else that did a tolerable job of it. It’s called doclifter <http://www.catb.org/~esr/doclifter/>. It will translate to either SGML or XML DocBook from man(7), mdoc(7), ms(7), or me(7) macros. See the documentation for details.


#### 18.5.5 Editing Tools
One thing we do not have in mid-2003 is a good open-source structure editor for SGML/XML documents.

LyX <http://www.lyx.org/> is a GUI word processor that uses LATEX for printing and supports structural editing of LATEX markup. There is a LATEX package that generates DocBook, and a how-to document <http://bgu.chez.tiscali.fr/doc/db4lyx/> describing how to write SGML and XML in the LyX GUI.

GNU TeXMacs <http://www.math.u-psud.fr/~anh/TeXmacs/TeXmacs.html> is a project aimed at producing an editor that is good for technical and mathematical material, including displayed formulas. 1.0 was released in April 2002. The developers plan XML support in the future, but it’s not there yet.

Most people still hack DocBook tags by hand using either vi or emacs.


#### 18.5.6 Related Standards and Practices
The tools are coming together, if slowly, to edit and format DocBook markup. But DocBook itself is a means, not an end. We’ll need other standards besides DocBook itself to accomplish the searchable-documentation-database objective. There are two big issues: document cataloging and metadata.

The ScrollKeeper <http://scrollkeeper.sourceforge.net/> project aims directly to meet this need. It provides a simple set of script hooks that can be used by package install and uninstall productions to register and unregister their documentation.

ScrollKeeper uses the Open Metadata Format <http://www.ibiblio.org/osrt/omf/>. This is a standard for indexing open-source documentation analogous to a library card-catalog system. The idea is to support rich search facilities that use the card-catalog metadata as well as the source text of the documentation itself.


#### 18.5.7 SGML
In previous sections, we have deliberately omitted a lot of DocBook’s history. XML has an older brother, Standard Generalized Markup Language (SGML).

Until mid-2002, no discussion of DocBook would have been complete without a long excursion into SGML, the differences between SGML and XML, and detailed descriptions of the SGML DocBook toolchain. Life can be simpler now; an XML DocBook toolchain is available in open source, works as well as the SGML toolchain ever did, and is easier to use.


#### 18.5.8 XML-DocBook References
One of the things that makes learning DocBook difficult is that the sites related to it tend to overwhelm the newbie with long lists of W3C standards, massive exercises in SGML theology, and dense thickets of abstract terminology. See XML in a Nutshell [Harold-Means] for a good book-length general introduction.

Norman Walsh’s DocBook: The Definitive Guide is available in print <http://www.oreilly.com/catalog/docbook/> and on the Web <http://www.docbook.org/tdg/en/html/docbook.html>. This is indeed the definitive reference, but as an introduction or tutorial it’s a disaster. Instead, read this:

Writing Documents Using DocBook <http://xml.web.cern.ch/XML/goossens/dbatcern/>. This is an excellent tutorial.

There is an equally excellent DocBook FAQ <http://www.dpawson.co.uk/docbook/> with a lot of material on styling HTML output. There is also a DocBook wiki <http://docbook.org/wiki/moin.cgi>.

Finally, the The XML Cover Pages <http://xml.coverpages.org/> will take you into the jungle of XML standards if you really want to go there.


### 18.6 Best Practices for Writing Unix Documentation
The advice we gave earlier in the chapter about reading Unix documentation can be turned around. When you write documentation for people within the Unix culture, don’t dumb it down. If you write as if for idiots, you will be written off as an idiot yourself. Dumbing documentation down is very different from making it accessible; the former is lazy and omits important things, whereas the latter requires careful thought and ruthless editing.

Don’t think for a moment that volume will be mistaken for quality. And especially, never ever omit functional details because you fear they might be confusing, nor warnings about problems because you don’t want to look bad. It is unanticipated problems that will cost you credibility and users, not the problems you were honest about.

Try to hit a happy medium in information density. Too low is as bad as too high. Use screen shots sparingly; they tend to convey little information beyond the style and feel of the interface. They are never a good substitute for clear textual description.

If your project is of any significant size, you should probably be shipping three different kinds of documentation: man pages as reference material, a tutorial manual, and a FAQ (Frequently Asked Questions) list. You should have a website as well, to serve as a central point of distribution (see the guidelines on communication in Chapter 19).

Huge man pages are viewed with some disfavor; navigation within them can be difficult. If yours are getting large, consider writing a reference manual, with the man page(s) giving a quick summary, pointers into the reference manual, and details of how the program(s) are invoked.

In your source code, include the standard metainformation files described in the Chapter 19 section on open-source release practices, such as README. Even if your code is going to be proprietary, these are Unix conventions and future maintainers coming from a Unix background will come up to speed faster if the conventions are followed.

Your man pages should be command references in the traditional Unix style for the traditional Unix audience. The tutorial manual should be long-form documentation for nontechnical users. And the FAQ should be an evolving resource that grows as your software support group learns what the frequent questions are and how to answer them.

There are more specific habits you should adopt if you want to get a little ahead of mid-2003’s practice:

Maintain your document masters in XML-DocBook. Even your man pages can be DocBook RefEntry documents. There is a very good HOWTO <http://www.linuxdoc.org/HOWTO/mini/Man-Page.html> on writing manual pages that explains the sections and organization your users will expect to see.
Ship the XML masters. Also, in case your users’ systems don’t have xmlto(1) ship the troff sources that you get by running xmlto man on your masters. Your software distribution’s installation procedure should install those in the normal way, but direct people to the XML files if they want to write or edit documentation.
Make your project’s installation package ScrollKeeper-ready.
Generate XHTML from your masters (with xmlto xhtml) and make it available from your project’s Web page.
Whether or not you’re using XML-DocBook as a master format, you’ll want to find a way to convert your documentation to HTML. Whether your software is open-source or proprietary, users are increasingly likely to find it via the Web. Putting your documentation on-line has the direct effect of making it easier for potential users and customers who know your software exists to read it and learn about it. It has the indirect effect that your software will become more likely to turn up in a Web search.

## 19. Open Source: Programming in the New Unix Community

Software is like sex—it’s better when it’s free.

—Linus Torvalds

We concluded Chapter 2 by observing the largest-scale pattern in Unix’s history; it flourished when its practices most closely approximated open source, and stagnated when they did not. We then asserted in Chapter 16 that open-source development tools tend to be of high quality. We’ll begin this chapter by sketching an explanation of how and why open-source development works. Most of its behaviors are simply intensifications of long-established Unix-tradition practices.

We’ll then descend from realm of abstraction and describe some of the most important folk customs that Unix has picked up from the open-source community—in particular, the community-evolved guidelines for what a good source-code release looks like. Many of these customs could be profitably adopted by developers on other modern operating systems as well.

We’ll describe these customs on the assumption that you are developing open source; most are still good ideas even if you are writing proprietary software. The open-source assumption is also historically appropriate, because many of these customs found their way back into proprietary Unix shops via ubiquitous open-source tools like patch(1), Emacs, and GCC.


### 19.1 Unix and Open Source
Open-source development exploits the fact that characterizing and fixing bugs—unlike, say, implementing a particular algorithm—is a task that lends itself well to being split into multiple parallel subtasks. Exploration of the neighborhood of possibilities near a prototype design also parallelizes well. With the right technological and social machinery in place, development teams that are loosely networked and very large can do astoundingly good work.

Astoundingly, that is, if you are carrying around the mental habits developed by people who treat process secrecy and proprietary control as a given. From The Mythical Man-Month [Brooks] until the rise of Linux, the orthodoxy in software engineering was all about small, closely managed teams within heavyweight organizations like corporations and government. The practice was of large teams closely managed.

The early Unix community, before the AT&T divestiture, was a paradigmatic example of open source in action. While the predivestiture Unix code was technically and legally proprietary, it was treated as a common within its user/developer community. Volunteer efforts were self-directed by the people most strongly motivated to solve problems. From these choices many good things flowed. Indeed, the technique of open-source development evolved as an unconscious folk practice in the Unix community for more than a quarter century, many years before it was analyzed and labeled in the late 1990s (See The Cathedral and the Bazaar [Raymond01] and Understanding Open Source Software Development [Feller-Fitzgerald].

In retrospect, it is rather startling how oblivious we all were to the implications of our own behavior. Several people came very close to understanding the phenomenon; Richard Gabriel in his “Worse Is Better” paper from 1990 [Gabriel] is the best known, but one can find prefigurations in Brooks [Brooks] (1975) and as far back as Vyssotsky and Corbató’s meditations on the Multics design (1965). I failed to get it over more than twenty years of observing software development, before being awakened by Linux in the mid-1990s. This experience should make any thoughtful and humble person wonder what other important unifying concepts are still implicit in our behavior and lurking right under our collective noses, hidden not by their complexity but by their very simplicity.

The rules of open-source development are simple:

Let the source be open. Have no secrets. Make the code and the process that produces it public. Encourage third-party peer review. Make sure that others can modify and redistribute the code freely. Grow the co-developer community as big as you can.
Release early, release often. A rapid release tempo means quick and effective feedback. When each incremental release is small, changing course in response to real-world feedback is easier.
Just make sure your first release builds, runs, and demonstrates promise. Usually, an initial version of an open-source program demonstrates promise by doing at least some portion of its final job, sufficient to show that the initiator can actually continue the project. For example, an initial version of a word processor might support typing in text and displaying it on the screen.

A first release that cannot be compiled or run can kill a project (as, famously, almost happened to the Mozilla browser). Releases that cannot compile suggest that the project developers will be unable to complete the project, Also, non-working programs are difficult for other developers to contribute to, because they cannot easily determine if any change they made improved the program or not.

Reward contribution with praise. If you can’t give your co-developers material rewards, give psychological ones. Even if you can, remember that people will often work harder for reputation than they would for gold.
A corollary of rule 2 is that individual releases should not be momentous events, with many promises attached and much preparation. It’s important to ruthlessly streamline your release process, so that you can do frequent releases painlessly. A setup where all other work must stop during release preparation is a terrible mistake. (Notably, if you’re using CVS or something similar, releases in preparation should be branches off the main line of development, so that they don’t block main-line progress.) To sum up, don’t treat releases as big special events; make them part of normal routine.

—Henry Spencer

Remember that the reason for frequent releases is to shorten and speed the feedback loop connecting your user population to your developers. Therefore, resist thinking of the next release as a polished jewel that cannot ship until everything is perfect. Don’t make long wish lists. Make progress incrementally, admit and advertise current bugs, and have confidence that perfection will come with time. Accept that you will go through dozens of point releases on the way, and don’t get upset as the version numbers mount.

Open-source development uses large teams of programmers distributed over the Internet and communicating primarily through email and Web documents. Typically, most contributors to any given project are volunteers contributing in order to be rewarded by the increased usefulness of the software to them, and by reputation incentives. A central individual or core group steers the project; other contributors may drop in and drop out sporadically. To encourage casual contributors, it is important to avoid erecting social barriers between them and the core team. Minimize the core team’s privileged status, and work hard to keep the boundaries inconspicuous.

Open-source projects follow the Unix-tradition advice of automating wherever possible. They use the patch(1) tool to pass around incremental changes. Many projects (and all large ones) have network-accessible code repositories using version-control systems like CVS (recall the discussion in Chapter 15). Use of automated bug- and patch-tracking systems is also common.

In 1997, almost nobody outside the hacker culture understood that it was even possible to run a large project this way, let alone get high-quality results. In 2003 this is no longer news; projects like Linux, Apache, and Mozilla have achieved both success and high public visibility.

Abandoning the habit of secrecy in favor of process transparency and peer review was the crucial step by which alchemy became chemistry. In the same way, it is beginning to appear that open-source development may signal the long-awaited maturation of software development as a discipline.


### 19.2 Best Practices for Working with Open-Source Developers
Much of what constitutes best practice in the open-source community is a natural adaptation to distributed development; you’ll read a lot in the rest of this chapter about behaviors that maintain good communication with other developers. Where Unix conventions are arbitrary (such as the standard names of files that convey metainformation about a source distribution) they often trace back either to Usenet in the early 1980s, or to the conventions and standards of the GNU project.


#### 19.2.1 Good Patching Practice
Most people become involved in open-source software by writing patches for other people’s software before releasing projects of their own. Suppose you’ve written a set of source-code changes for someone else’s baseline code. Now put yourself in that person’s shoes. How is he to judge whether to include the patch?

It is very difficult to judge the quality of code, so developers tend to evaluate patches by the quality of the submission. They look for clues in the submitter’s style and communications behavior instead—indications that the person has been in their shoes and understands what it’s like to have to evaluate and merge an incoming patch.

This is actually a rather reliable proxy for code quality. In many years of dealing with patches from many hundreds of strangers, I have only seldom seen a patch that was thoughtfully presented and respectful of my time but technically bogus. On the other hand, experience teaches that patches which look careless or are packaged in a lazy and inconsiderate way are very likely to actually be bogus.

Here are some tips on how to get your patch accepted:


#### 19.2.1.1 Do send patches, don’t send whole archives or files.
If your change includes a new file that doesn’t exist in the code, then of course you have to send the whole file. But if you’re modifying an already-existing file, don’t send the whole file. Send a diff instead; specifically, send the output of the diff(1) command run to compare the baseline distributed version against your modified version.

The diff(1) command and its dual, patch(1), are the most basic tools of open-source development. Diffs are better than whole files because the developer you’re sending a patch to may have changed the baseline version since you got your copy. By sending him a diff you save him the effort of separating your changes from his; you show respect for his time.


#### 19.2.1.2 Send patches against the current version of the code.
It is both counterproductive and rude to send a maintainer patches against the code as it existed several releases ago, and expect him to do all the work of determining which changes duplicate things he has since done, versus which things are actually novel in your patch.

As a patch submitter, it is your responsibility to track the state of the source and send the maintainer a minimal patch that expresses what you want done to the main-line codebase. That means sending a patch against the current version.


#### 19.2.1.3 Don’t include patches for generated files.
Before you send your patch, walk through it and delete any patch bands for files in it that are going to be automatically regenerated once the maintainer applies the patch and remakes. The classic examples of this error are C files generated by Bison or Flex.

These days the most common mistake of this kind is sending a diff with a huge band that is nothing but changebars between your configure script and the maintainer’s. This file is generated by autoconf.

This is inconsiderate. It means your recipient is put to the trouble of separating the real content of the patch from a lot of bulky noise. It’s a minor error, not as important as some of the things we’ll get to further on—but it will count against you.


#### 19.2.1.4 Don’t send patch bands that just tweak RCS or SCCS $-symbols.
Some people put special tokens in their source files that are expanded by the version-control system when the file is checked in: the $Id$ construct used by RCS and CVS, for example.

If you’re using a local version-control system yourself, your changes may alter these tokens. This isn’t really harmful, because when your recipient checks his code back in after applying your patch the tokens will be reexpanded in accordance with the maintainer’s version-control status. But those extra patch bands are noise. They’re distracting. It’s more considerate not to send them.

This is another minor error. You’ll be forgiven for it if you get the big things right. But you want to avoid it anyway.


#### 19.2.1.5 Do use -c or -u format, don’t use the default (-e) format.
The default (-e) format of diff(1) is very brittle. It doesn’t include any context, so the patch tool can’t cope if any lines have been inserted or deleted in the baseline code since you took the copy you modified.

Getting an -e diff is annoying, and suggests that the sender is either an extreme newbie, careless, or clueless. Most such patches get tossed out without a second thought.


#### 19.2.1.6 Do include documentation with your patch.
This is very important. If your patch makes a user-visible addition or change to the software’s features, include changes to the appropriate man pages and other documentation files in your patch. Do not assume that the recipient will be happy to document your code for you, or to have undocumented features lurking in the code.

Documenting your changes well demonstrates some good things. First, it’s considerate to the person you are trying to persuade. Second, it shows that you understand the ramifications of your change well enough to explain it to somebody who can’t see the code. Third, it demonstrates that you care about the people who will ultimately use the software.

Good documentation is usually the most visible sign of what separates a solid contribution from a quick and dirty hack. If you take the time and care necessary to produce it, you’ll find you’re already 85% of the way to having your patch accepted by most developers.


#### 19.2.1.7 Do include an explanation with your patch.
Your patch should include cover notes explaining why you think the patch is necessary or useful. This is explanation directed not to the users of the software but to the maintainer to whom you are sending the patch.

The note can be short—in fact, some of the most effective cover notes I’ve ever seen just said “See the documentation updates in this patch”. But it should show the right attitude.

The right attitude is helpful, respectful of the maintainer’s time, quietly confident but unassuming. It’s good to display understanding of the code you’re patching. It’s good to show that you can identify with the maintainer’s problems. It’s also good to be up front about any risks you perceive in applying the patch. Here are some examples of the sorts of explanatory comments that experienced developers send:

“I’ve seen two problems with this code, X and Y. I fixed problem X, but I didn’t try addressing problem Y because I don’t think I understand the part of the code that I believe is involved”.

“Fixed a core dump that can happen when one of the foo inputs is too long. While I was at it, I went looking for similar overflows elsewhere. I found a possible one in blarg.c, near line 666. Are you sure the sender can’t generate more than 80 characters per transmission?”

“Have you considered using the Foonly algorithm for this problem? There is a good implementation at <http://www.example.com/~jsmith/foonly.html>”.

“This patch solves the immediate problem, but I realize it complicates the memory allocation in an unpleasant way. Works for me, but you should probably test it under heavy load before shipping”.

“This may be featuritis, but I’m sending it anyway. Maybe you’ll know a cleaner way to implement the feature”.


#### 19.2.1.8 Do include useful comments in your code.
A maintainer will want to have strong confidence that he understands your changes before merging them in. This isn’t an invariable rule; if you have a track record of good work with the maintainer, he may just run a casual eye over the changes before checking them in semiautomatically. But everything you can do to help him understand your code and decrease his uncertainty increases your chances that your patch will be accepted.

Good comments in your code help the maintainer understand it. Bad comments don’t.

Here’s an example of a bad comment:

/* norman newbie fixed this 13 Aug 2001 */


This conveys no information. It’s nothing but a muddy territorial bootprint you’re planting in the middle of the maintainer’s code. If he takes your patch (which you’ve made less likely) he will almost certainly strip out this comment. If you want a credit, include a patch band for the project NEWS or HISTORY file. He’s more likely to take that.

Here’s an example of a good comment:

images

This comment shows that you understand not only the maintainer’s code but the kind of information that he needs to have confidence in your changes. This kind of comment gives him confidence in your changes.


#### 19.2.1.9 Don’t take it personally if your patch is rejected
There are lots of reasons a patch can be rejected that don’t reflect on you. Remember that most maintainers are under heavy time pressure, and have to be conservative in what they accept lest the project code get broken. Sometime resubmitting with improvements will help. Sometimes it won’t. Life is hard.


#### 19.2.2 Good Project- and Archive-Naming Practice
As the load on maintainers of archives like ibiblio, SourceForge, and CPAN increases, there is an increasing trend for submissions to be processed partly or wholly by programs (rather than entirely by a human).

This makes it more important for project and archive-file names to fit regular patterns that computer programs can parse and understand.


#### 19.2.2.1 Use GNU-style names with a stem and major.minor.patch numbering.
It’s helpful to everybody if your archive files all have GNU-like names—all-lower-case alphanumeric stem prefix, followed by a hyphen, followed by a version number, extension, and other suffixes.

A good general form of name has these parts in order:

project prefix
dash
version number
dot
“src” or “bin” (optional)
dot or dash (dot preferred)
binary type and options (optional)
archiving and compression extensions
Name stems in this style can contain hyphen or underscores to separate syllables; dashes are actually preferred. It is good practice to group related projects by giving the stems a common hyphen-terminated prefix.

Let’s suppose you have a project you call ’foobar’ at major version 1, minor version or release 2, patchlevel 3. If it’s got just one archive part (presumably the sources), here’s what its names should look like like:

foobar-1.2.3.tar.gz

The source archive.

foobar.lsm

The LSM file (assuming you’re submitting to ibiblio).

Please don’t use names like these:

foobar123.tar.gz

This looks to many programs like an archive for a project called “foobar123” with no version number.

foobar1.2.3.tar.gz

This looks to many programs like an archive for a project called “foobar1” at version 2.3.

foobar-v1.2.3.tar.gz

Many programs think this goes with a project called “foobar-v1”.

foo_bar-1.2.3.tar.gz

The underscore is hard for people to speak, type, and remember.

FooBar-1.2.3.tar.gz

Unless you like looking like a marketing weenie. This is also hard for people to speak, type, and remember.

If you have to differentiate between source and binary archives, or between different kinds of binary, or express some kind of build option in the file name, please treat that as a file extension to go after the version number. That is, please do this:

foobar-1.2.3.src.tar.gz

Sources.

foobar-1.2.3.bin.tar.gz

Binaries, type not specified.

foobar-1.2.3.bin.i386.tar.gz

i386 binaries.

foobar-1.2.3.bin.i386.static.tar.gz

i386 binaries statically linked.

foobar-1.2.3.bin.SPARC.tar.gz

SPARC binaries.

Please don’t use names like ’foobar-i386–1.2.3.tar.gz’, because programs have a hard time telling type infixes (like ’-i386’) from the stem.

The convention for distinguishing major from minor release is simple: you increment the patch level for fixes or minor features, the minor version number for compatible new features, and the major version number when you make incompatible changes.


#### 19.2.2.2 But respect local conventions where appropriate.
Some projects and communities have well-defined conventions for names and version numbers that aren’t necessarily compatible with the above advice. For instance, Apache modules are generally named like mod_foo, and have both their own version number and the version of Apache with which they work. Likewise, Perl modules have version numbers that can be treated as floating point numbers (e.g., you might see 1.303 rather than 1.3.3), and the distributions are generally named Foo-Bar-1.303.tar.gz for version 1.303 of module Foo::Bar. (Perl itself, on the other hand, switched to using the conventions described here in late 1999.)

Look for and respect the conventions of specialized communities and developers; for general use, follow the above guidelines.


#### 19.2.2.3 Try hard to choose a name prefix that is unique and easy to type.
The stem prefix should be common to all of a project’s files, and it should be easy to read, type, and remember. So please don’t use underscores. And don’t capitalize or BiCapitalize without extremely good reason—it messes up the natural human-eyeball search order and looks like some marketing weenie trying to be clever.

It confuses people when two different projects have the same stem name. So try to check for collisions before your first release. Two good places to check are the index file of ibiblio <http://metalab.unc.edu/pub/Linux> and the application index at Freshmeat <http://www.freshmeat.net>. Another good place to check is SourceForge <http://www.sourceforge.net>; do a name search there.


#### 19.2.3 Good Development Practice
Here are some of the behaviors that can make the difference between a successful project with lots of contributors and one that stalls out after attracting no interest:


#### 19.2.3.1 Don’t rely on proprietary code.
Don’t rely on proprietary languages, libraries, or other code. Doing so is risky business at the best of times; in the open-source community, it is considered downright rude. Open-source developers don’t trust code for which they can’t review the source.


#### 19.2.3.2 Use GNU Autotools.
Configuration choices should be made at compile time. A significant advantage of open-source distributions is that they allow the package to adapt at compile-time to the environment it finds. This is critical because it allows the package to run on platforms its developers have never seen, and it allows the software’s community of users to do their own ports. Only the largest of development teams can afford to buy all the hardware and hire enough employees to support even a limited number of platforms.

Therefore: Use the GNU autotools to handle portability issues, do system-configuration probes, and tailor your makefiles. People building from sources today expect to be able to type configure; make; make install and get a clean build—and rightly so. There is a good tutorial on these tools <http://seul.org/docs/autotut/>.

autoconf and autoheader are mature. automake, as we’ve previously noted, is still buggy and brittle as of mid-2003; you may have to maintain your own Makefile.in. Fortunately it’s the least important of the autotools.

Regardless of your approach to configuration, do not ask the user for system information at compile-time. The user installing the package does not know the answers to your questions, and this approach is doomed from the start. The software must be able to determine for itself any information that it may need at compile- or install-time.

But autoconf should not be regarded as a license for knob-ridden designs. If at all possible, program to standards like POSIX and refrain also from asking the system for configuration information. Keep ifdefs to a minimum—or, better yet, have none at all.


#### 19.2.3.3 Test your code before release.
A good test suite allows the team to easily run regression tests before releases. Create a strong, usable test framework so that you can incrementally add tests to your software without having to train developers in the specialized intricacies of the test suite.

Distributing the test suite allows the community of users to test their ports before contributing them back to the group.

Encourage your developers to use a wide variety of platforms as their desktop and test machines, so that code is continuously being tested for portability flaws as part of normal development.

It is good practice, and encourages confidence in your code, when it ships with the test suite you use, and that test suite can be run with make test.


#### 19.2.3.4 Sanity-check your code before release.
By “sanity check” we mean: use every tool available that has a reasonable chance of catching errors a human would be prone to overlook. The more of these you catch with tools, the fewer your users and you will have to contend with.

If you’re writing C/C++ using GCC, test-compile with -Wall and clean up all warning messages before each release. Compile your code with every compiler you can find—different compilers often find different problems. Specifically, compile your software on a true 64-bit machine. Underlying datatypes can change on 64-bit machines, and you will often find new problems there. Find a Unix vendor’s system and run the lint utility over your software.

Run tools that look for memory leaks and other runtime errors; Electric Fence and Valgrind are two good ones available in open source.

For Python projects, the PyChecker <http://sourceforge.net/projects/pychecker> program can be a useful check. It often catches nontrivial errors.

If you’re writing Perl, check your code with perl -c (and maybe -T, if applicable). Use perl -w and ’use strict’ religiously. (See the Perl documentation for further discussion.)


#### 19.2.3.5 Spell-check your documentation and READMEs before release.
Spell-check your documentation, README files and error messages in your software. Sloppy code, code that produces warning messages when compiled, and spelling errors in README files or error messages, all lead users to believe the engineering behind it is also haphazard and sloppy.


#### 19.2.3.6 Recommended C/C++ Portability Practices
If you are writing C, feel free to use the full ANSI features. Specifically, do use function prototypes, which will help you spot cross-module inconsistencies. The old-style K&R compilers are ancient history.

Do not assume compiler-specific features such as the GCC -pipe option or nested functions are available. These will come around and bite you the second somebody ports to a non-Linux, non-GCC system.

Code required for portability should be isolated to a single area and a single set of source files (for example, an os subdirectory). Compiler, library and operating system interfaces with portability issues should be abstracted to files in this directory.

A portability layer is a library (or perhaps just a set of macros in header files) that abstracts away just the parts of an operating system’s API your program is interested in. Portability layers make it easier to do new software ports. Often, no member of the development team knows the porting platform (for example, there are literally hundreds of different embedded operating systems, and nobody knows any significant fraction of them). By creating a separate portability layer, it becomes possible for a specialist who knows a platform to port your software without having to understand anything outside the portability layer.

Portability layers also simplify applications. Software rarely needs the full functionality of more complex system calls such as mmap(2) or stat(2), and programmers commonly configure such complex interfaces incorrectly. A portability layer with abstracted interfaces (say, something named __file_exists instead of a call to stat(2)) allows you to import only the limited, necessary functionality from the system, simplifying the code in your application.

Always write your portability layer to select based on a feature, never based on a platform. Trying to create a separate portability layer for each supported platform results in a multiple update problem maintenance nightmare. A “platform” is always selected on at least two axes: the compiler and the library/operating system release. In some cases there are three axes, as when Linux vendors select a C library independently of the operating system release. With M vendors, N compilers, and O operating system releases, the number of platforms quickly scales out of reach of any but the largest development teams. On the other hand, by using language and systems standards such as ANSI and POSIX 1003.1, the set of features is relatively constrained.

Portability choices can be made along either lines of code or compiled files. It doesn’t make a difference if you select alternate lines of code on a platform, or one of a few different files. A rule of thumb is to move portability code for different platforms into separate files when the implementations diverge significantly (shared memory mapping on Unix vs. Windows), and leave portability code in a single file when the differences are minimal (for example, whether you’re using gettimeofday, clock_gettime, ftime or time to find out the current time-of-day).

For anywhere outside a portability layer, heed this advice:

#ifdef and #if are last resorts, usually a sign of failure of imagination, excessive product differentiation, gratuitous “optimization” or accumulated trash. In the middle of code they are anathema. /usr/include/stdio.h from GNU is an archetypical horror.

—Doug McIlroy

Use of #ifdef and #if is permissible (if well controlled) within a portability layer. Outside it, try hard to confine these to conditionalizing #includes based on feature symbols.

Never intrude on the namespace of any other part of the system, including filenames, error return values and function names. Where the namespace is shared, document the portion of the namespace that you use.

Choose a coding standard. The debate over the choice of standard can go on forever—regardless, it is too difficult and expensive to maintain software built using multiple coding standards, and so some common style must be chosen. Enforce your coding standard ruthlessly, as consistency and cleanliness of the code are of the highest priority; the details of the coding standard itself are a distant second.


#### 19.2.4 Good Distribution-Making Practice
These guidelines describe how your distribution should look when someone downloads, retrieves and unpacks it.


#### 19.2.4.1 Make sure tarballs always unpack into a single new directory.
The single most annoying mistake fledgling contributors make is to build tarballs that unpack the files and directories in the distribution into the current directory, potentially overwriting files already located there. Never do this!

Instead, make sure your archive files all have a common directory part named after the project, so they will unpack into a single top-level directory directly beneath the current one. Conventionally, the name of the directory should be the same as the stem of the tarball’s name. So, for example, a tarball named foo-0.23.tar.gz is expected to unpack into a subdirectory named foo-0.23.

Example 19.1 shows a makefile trick that, assuming your distribution directory is named “foobar” and SRC contains a list of your distribution files, accomplishes this.


Example 19.1. tar archive maker production.

images


#### 19.2.4.2 Include a README.
Include a file called README that is a roadmap of your source distribution. By ancient convention (originating with Dennis Ritchie himself before 1980, and promulgated on Usenet in the early 1980s), this is the first file intrepid explorers will read after unpacking the source.

README files should be short and easy to read. Make yours an introduction, not an epic. Good things to have in the README include the following:

A brief description of the project.
A pointer to the project website (if it has one).
Notes on the developer’s build environment and potential portability problems.
A roadmap describing important files and subdirectories.
Either build/installation instructions or a pointer to a file containing same (usually INSTALL).
Either a maintainers/credits list or a pointer to a file containing same (usually CREDITS).
Either recent project news or a pointer to a file containing same (usually NEWS).
Project mailing list addresses.
At one time this file was commonly READ.ME, but this interacts badly with browsers, who are all too likely to assume that the .ME suffix means it’s not textual and can only be downloaded rather than browsed. This usage is deprecated.


#### 19.2.4.3 Respect and follow standard file-naming practices.
Before even looking at the README, your intrepid explorer will have scanned the filenames in the top-level directory of your unpacked distribution. Those names can themselves convey information. By adhering to certain standard naming practices, you can give the explorer valuable clues about where to look next.

Here are some standard top-level file names and what they mean. Not every distribution needs all of these.

README

The roadmap file, to be read first.

INSTALL

Configuration, build, and installation instructions.

AUTHORS

List of project contributors (GNU convention).

NEWS

Recent project news.

HISTORY

Project history.

CHANGES

Log of significant changes between revisions.

COPYING

Project license terms (GNU convention).

LICENSE

Project license terms.

FAQ

Plain-text Frequently-Asked-Questions document for the project.

Note the overall convention that filenames with all-caps names are human-readable metainformation about the package, rather than build components. This elaboration of the README was developed early on at the Free Software Foundation.

Having a FAQ file can save you a lot of grief. When a question about the project comes up often, put it in the FAQ; then direct users to read the FAQ before sending questions or bug reports. A well-nurtured FAQ can decrease the support burden on the project maintainers by an order of magnitude or more.

Having a HISTORY or NEWS file with timestamps in it for each release is valuable. Among other things, it may help establish prior art if you are ever hit with a patent-infringement lawsuit (this hasn’t happened to anyone yet, but best to be prepared).


#### 19.2.4.4 Design for upgradability.
Your software will change over time as you put out new releases. Some of these changes will not be backward-compatible. Accordingly, you should give serious thought to designing your installation layouts so that multiple installed versions of your code can coexist on the same system. This is especially important for libraries—you can’t count on all your client programs to upgrade in lockstep with your API changes.

The Emacs, Python, and Qt projects have a good convention for handling this: version-numbered directories (another practice that seems to have been made routine by the FSF). Here’s how an installed Qt library hierarchy looks (${ver} is the version number):

images

With this organization, multiple versions can coexist. Client programs have to specify the library version they want, but that’s a small price to pay for not having the interfaces break on them. This good practice avoids the notorious “DLL Hell” failure mode of Windows.


#### 19.2.4.5 Under Linux, provide RPMs.
The de facto standard format for installable binary packages under Linux that used by the Red Hat Package manager, RPM. It’s featured in the most popular Linux distribution, and supported by effectively all other Linux distributions (except Debian and Slackware; and Debian can install from RPMs). Accordingly, it’s a good idea for your project site to provide installable RPMs as well as source tarballs.

It’s also a good idea for you to include in your source tarball the RPM spec file, with a production that makes RPMs from it in your makefile. The spec file should have the extension .spec; that’s how the rpm -t option finds it in a tarball.

For extra style points, generate your spec file with a shellscript that automatically plugs in the correct version number by analyzing the project makefile or a version.h.

Note: If you supply source RPMs, use BuildRoot to make the program be built in /tmp or /var/tmp. If you don’t, during the course of running the make install part of your build, the install will install the files in the real final places. This will happen even if there are file collisions, and even if you didn’t want to install the package at all. When you’re done, the files will have been installed and your system’s RPM database will not know about it. Such badly behaved SRPMs are a minefield and should be eschewed.


#### 19.2.4.6 Provide checksums.
Provide checksums with your binaries (tarballs, RPMs, etc.). This will allow people to verify that they haven’t been corrupted or had Trojan-horse code inserted in them.

While there are several commands you can use for this purpose (such as sum and cksum) it is best to use a cryptographically-secure hash function. The GPG package provides this capability via the --detach-sign option; so does the GNU command md5sum.

For each binary you ship, your project Web page should list the checksum and the command you used to generate it.


#### 19.2.5 Good Communication Practice
Your software and documentation won’t do the world much good if nobody but you knows they exist. Also, developing a visible presence for the project on the Internet will assist you in recruiting users and co-developers. Here are the standard ways to do that.


#### 19.2.5.1 Announce to Freshmeat.
Announce to Freshmeat <http://www.freshmeat.net>. Besides being widely read itself, this group is a major feeder for Web-based technical news channels.

Never assume the audience has been reading your release announcements since the beginning of time. Always include at least a one-line description of what the software does. Bad example: “Announcing the latest release of FooEditor, now with themes and ten times faster”. Good example: “Announcing the latest release of FooEditor, the scriptable editor for touch-typists, now with themes and ten times faster”.


#### 19.2.5.2 Announce to a relevant topic newsgroup.
Find a Usenet topic group directly relevant to your application, and announce there as well. Post only where the function of the code is relevant, and exercise restraint.

If (for example) you are releasing a program written in Perl that queries IMAP servers, you should certainly post to comp.mail.imap. But you should probably not post to comp.lang.perl unless the program is also an instructive example of cutting-edge Perl techniques.

Your announcement should include the URL of a project website.


#### 19.2.5.3 Have a website.
If you intend trying to build any substantial user or developer community around your project, it should have a website. Standard things to have on the website include:

• The project charter (why it exists, who the audience is, etc.).

• Download links for the project sources.

• Instructions on how to join the project mailing list(s).

• A FAQ (Frequently Asked Questions) list.

• HTMLized versions of the project documentation.

• Links to related and/or competing projects.

Refer to the website examples in Chapter 16 for examples of what a well-educated project website looks like.

An easy way to have a website is to put your project on one of the sites that specializes in providing free hosting. In 2003 the two most important of these are SourceForge (which is a demonstration and test site for proprietary collaboration tools) or Savannah (which hosts open-source projects as an ideological statement).


#### 19.2.5.4 Host project mailing lists.
It’s standard practice to have a private development list through which project collaborators can communicate and exchange patches. You may also want to have an announcements list for people who want to be kept informed of the project’s progress.

If you are running a project named ’foo’, your developer list might be foo-dev or foo-friends; your announcement list might be foo-announce.

An important decision is just how private the “private” development list is. Wider participation in design discussions is often a good thing, but if the list is relatively open, sooner or later you will get people asking new-user questions on it. Opinions vary on how best to solve this problem. Just having the documentation tell the new users not to ask elementary questions on the development list is not a solution; such a request must be enforced somehow.

An announcements list needs to be tightly controlled. Traffic should be at most a few messages a month; the whole purpose of such a list is to accommodate people who want to know when something important happens, but don’t want to hear about day-to-day details. Most such people will quickly unsubscribe if the list starts generating significant clutter in their mailboxes.


#### 19.2.5.5 Release to major archives.
See the section Where Should I Look? in Chapter 16 for specifics on the major open-source archive sites. You should release your package to these.

Other important locations include:

• The Python Software Activity <http://www.python.org> site (for software written in Python).

• The CPAN <http://www.language.perl.com/CPAN>, the Comprehensive Perl Archive Network (for software written in Perl).


### 19.3 The Logic of Licenses: How to Pick One
The choice of license terms involves decisions about what, if any restrictions the author wants to put on what people do with the software.

If you want to make no restrictions at all, you should put your software in the public domain. An appropriate way to do this would be to include something like the following text at the head of each file:

Placed in public domain by J. Random Hacker, 2003. Share and enjoy!


If you do this, you are surrendering your copyright. Anyone can do anything they like with any part of the text. It doesn’t get any freer than this.

But very little open-source software is actually placed in the public domain. Some open-source developers want to use their ownership of the code to ensure that it stays open (these tend to adopt the GPL). Others simply want to control their legal exposure; one of the things all open-source licenses have in common is a disclaimer of warranty.


### 19.4 Why You Should Use a Standard License
The widely known licenses conforming to the Open Source Definition have well-established interpretive traditions. Developers (and, to the extent they care, users) know what they imply, and have a reasonable take on the risks and tradeoffs they involve. Therefore, use one of the standard licenses carried on the OSI site if at all possible.

If you must write your own license, be sure to have it certified by OSI. This will avoid a lot of argument and overhead. Unless you’ve been through it, you have no idea how nasty a licensing flamewar can get; people become passionate because the licenses are regarded as almost-sacred covenants touching the core values of the open-source community.

Furthermore, the presence of an established interpretive tradition may prove important if your license is ever tested in court. At time of writing (mid-2003) there is no case law either supporting or invalidating any open-source license. However, it is a legal doctrine (at least in the United States, and probably in other common-law countries such as England and the rest of the British Commonwealth) that courts are supposed to interpret licenses and contracts according to the expectations and practices of the community in which they originated. There is thus good reason to hope that open-source community practice will be determinative when the court system finally has to cope.


### 19.5 Varieties of Open-Source Licensing

#### 19.5.1 MIT or X Consortium License
The loosest kind of free-software license is one that grants unrestricted rights to copy, use, modify, and redistribute modified copies as long as a copy of the copyright and license terms is retained in all modified versions. But when you accept this license you do give up the right to sue the maintainers.

You can find a template for the standard X Consortium license at the OSI site <http://www.opensource.org/licenses/mit-license.html>.


#### 19.5.2 BSD Classic License
The next least restrictive kind of license grants unrestricted rights to copy, use, modify, and redistribute modified copies as long as a copy of the copyright and license terms is retained in all modified versions, and an acknowledgment is made in advertising or documentation associated with the package. Grantee has to give up the right to sue the maintainers.

The original BSD license is the best-known license of this kind. Among parts of the free-software culture that trace their lineages back to BSD Unix, this license is used even on a lot of free software that was written thousands of miles from Berkeley.

It is also not uncommon to find minor variants of the BSD license that change the copyright holder and omit the advertising requirement (making it effectively equivalent to the MIT license). Note that in mid-1999 the Office of Technology Transfer of the University of California rescinded the advertising clause in the BSD license. So the license on the BSD software has been relaxed in exactly this way. Should you choose the BSD approach, we strongly recommend that you use the new license (without advertising clause) rather than the old. That requirement was dropped because it led to significant legal and procedural complications over what constituted advertising.

You can find a BSD license template at the OSI site <http://www.opensource.org/licenses/bsd-license.html>.


#### 19.5.3 Artistic License
The next most restrictive kind of license grants unrestricted rights to copy, use, and locally modify. It allows redistribution of modified binaries, but restricts redistribution of modified sources in ways intended to protect the interests of the authors and the free-software community.

The Artistic License, devised for Perl and widely used in the Perl developer community, is of this kind. It requires modified files to contain “prominent notice” that they have been altered. It also requires people who redistribute changes to make them freely available and make efforts to propagate them back to the free-software community.

You can find a copy of the Artistic License at the OSI site <http://www.opensource.org/licenses/artistic-license.html>.


#### 19.5.4 General Public License
The GNU General Public License (and its derivative, the Library or “Lesser” GPL) is the single most widely used free-software license. Like the Artistic License, it allows redistribution of modified sources provided the modified files bear “prominent notice”.

The GPL requires that any program containing parts that are under GPL be wholly GPLed. (The exact circumstances that trigger this requirement are not perfectly clear to everybody.)

These extra requirements actually make the GPL more restrictive than any of the other commonly used licenses. (Larry Wall developed the Artistic License to avoid them while serving many of the same objectives.)

You can find a pointer to the GPL, and instructions about how to apply it, at FSF copyleft site <http://www.gnu.org/copyleft.html>.


#### 19.5.5 Mozilla Public License
The Mozilla Public License supports software that is open source, but may be linked with closed-source modules or extensions. It requires that the distributed software (“Covered Code”) remain open, but permits add-ons called through a defined API to remain closed.

You can find a template for the MPL at the OSI site <http://www.opensource.org/licenses/MPL-1.1.html>.

## 20. Futures: Dangers and Opportunities

The best way to predict the future is to invent it.

Uttered during a 1971 meeting at XEROX PARC
—Alan Kay

History is not over. Unix will continue to grow and change. The community and the tradition around Unix will continue to evolve. Trying to forecast the future is a chancy business, but we can perhaps anticipate it in two ways: first, by looking at how Unix has coped with design challenges in the past; second, by identifying problems that are looking for solutions and opportunities waiting to be exploited.


### 20.1 Essence and Accident in Unix Tradition
To understand how Unix’s design might change in the future, we can start by looking at how Unix programming style has changed over time in the past. This effort leads us directly to one of the challenges of understanding the Unix style—distinguishing between accident and essence. That is, recognizing traits that arise from transient technical circumstances versus those that are deeply tied to the central Unix design challenge—how to do modularity and abstraction right while also keeping systems transparent and simple.

This distinction can be difficult, because traits that arose as accidents have sometimes turned out to have essential utility. Consider as an example the ’Silence is golden’ rule of Unix interface design we examined in Chapter 11; it began as an adaptation to slow teletypes, but continued because programs with terse output could be combined in scripts more easily. Today, in an environment where having many programs running visibly through a GUI is normal, it has a third kind of utility: silent programs don’t distract or waste the user’s attention.

On the other hand, some traits that once seemed essential to Unix turned out to be accidents tied to a particular set of cost ratios. For example, old-school Unix favored program designs (and minilanguages like awk(1)) that did line-at-a-time processing of an input stream or record-at-a-time processing of binary files, with any context that needed to be maintained between pieces carried by elaborate state-machine code. New-school Unix design, on the other hand, is generally happy with the assumption that a program can read its entire input into memory and thereafter randomly access it at will. Indeed, modern Unixes supply an mmap(2) call that allows the programmer to map an entire file into virtual memory and completely hides the serialization of I/O to and from disk space.

This change trades away storage economy to get simpler and more transparent code. It’s an adaptation to the plunging cost of memory relative to programmer time. Many of the differences between old-school Unix designs in the 1970s and 1980s and those of the new post-1990 school can be traced to the huge shift in relative costs that today makes all machine resources several orders of magnitude cheaper relative to programmer time than they were in 1969.

Looking back, we can identify three specific technology changes that have driven significant changes in Unix design style: internetworking, bitmapped graphics displays, and the personal computer. In each case, the Unix tradition has adapted to the challenge by discarding accidents that were no longer adaptive and finding new applications for its essential ideas. Biological evolution works this way too. Evolutionary biologists have a rule: “Don’t assume that historical origin specifies current utility, or vice versa”. A brief look at how Unix adapted in each of these cases may provide some clues to how Unix might adapt itself to future technology shifts that we cannot yet anticipate.

Chapter 2 described the first of these changes: the rise of internetworking, from the angle of cultural history, telling how TCP/IP brought the original Unix and ARPANET cultures together after 1980. In Chapter 7, the material on obsolescent IPC and networking methods such as System V STREAMS hints at the many false starts, missteps, and dead ends that preoccupied Unix developers through much of the following decade. There was a good deal of confusion about protocols,1 and about the relationship between intermachine networking and interprocess communication among processes on the same machine.

1 For a few years it looked like ISO’s 7-layer networking standard might compete successfully with TCP/IP. It was promoted by a European standards committee politically horrified at the thought of adopting any technology birthed in the bowels of the Pentagon. Alas, their indignation exceeded their technical acuity. The result proved overcomplicated and unhelpful; see [Padlipsky] for details.

Eventually the confusion was cleared up when TCP/IP won and BSD sockets reasserted Unix’s essential everything-is-a-byte-stream metaphor. It became normal to use BSD sockets for both IPC and networking, older methods for both largely fell out of use, and Unix software grew increasingly indifferent to whether communicating components were hosted on the same or different machines. The invention of the World Wide Web in 1990–1991 was the logical result.

When bitmapped graphics and the example of the Macintosh arrived in 1984 a few years after TCP/IP, they posed a rather more difficult challenge. The original GUIs from Xerox PARC and Apple were beautiful, but wired together far too many levels of the system for Unix programmers to feel comfortable with their design. The prompt response of Unix programmers was to make separation of policy from mechanism an explicit principle; the X windowing system established it by 1988. By splitting X widget sets away from the display manager that was doing low-level graphics, they created an architecture that was modular and clean in Unix terms, and one that could easily evolve better policy over time.

But that was the easy part of the problem. The hard part was deciding whether Unix ought to have a unified interface policy at all, and if so what it ought to be. Several different attempts to establish one through proprietary toolkits (like Motif) failed. Today, in 2003, GTK and Qt contend with each other for the role. While the debate on this question is not over in 2003, the persistence of different UI styles that we noted in Chapter 11 seems telling. New-school Unix design has kept the command line, and dealt with the tension between GUI and CLI approaches by writing lots of CLI-engine/GUI-interface pairs that can be used in both styles.

The personal computer posed few major design challenges as a technology in itself. The 386 and later chips were powerful enough to give the systems designed around them cost ratios similar to those of the minicomputers, workstations, and servers on which Unix matured. The true challenge was a change in the potential market for Unix; the much lower overall price of the hardware made personal computers attractive to a vastly broader, less technically sophisticated user population.

The proprietary-Unix vendors, accustomed to the fatter margins from selling more powerful systems to sophisticated buyers, were never interested in this wider market. The first serious initiatives toward the end-user desktop came out of the open-source community and were mounted for essentially ideological reasons. As of mid-2003, market surveys indicate that Linux has reached about 4%–5% share there, closely comparable to the Apple Macintosh’s.

Whether or not Linux ever does substantially better than this, the nature of the Unix community’s response is already clear. We examined it in the study of Linux in Chapter 3. It includes adopting a few technologies (such as XML) from elsewhere, and putting a lot of effort into naturalizing GUIs into the Unix world. But underneath the themed GUIs and the installation packaging, the main emphasis is still on modularity and clean code—on getting the infrastructure for serious, high-reliability computing and communications right.

The history of the large-scale desktop-focused developments like Mozilla and OpenOffice.org that were launched in the late 1990s illustrates this emphasis well. In both these cases, the most important theme in community feedback wasn’t demand for new features or pressure to make a ship date—it was distaste for monster monoliths, and a general sense that these huge programs would have to be slimmed down, refactored, and carved into modules before they would be other than embarrassments.

Despite being accompanied by a great deal of innovation, the responses to all three technologies were conservative with regard to the fundamental Unix design rules—modularity, transparency, separation of policy from mechanism, and the other qualities we’ve tried to characterize earlier in this book. The learned response of Unix programmers, reinforced over thirty years, was to go back to first principles—to try to get more leverage out of Unix’s basic abstractions of streams, namespaces, and processes in preference to layering on new ones.


### 20.2 Plan 9: The Way the Future Was
We know what Unix’s future used to look like. It was designed by the research group at Bell Labs that built Unix and called ’Plan 9 from Bell Labs’.2 Plan 9 was an attempt to do Unix over again, better.

2 The name is a tribute to the 1958 movie that has passed into legend as “the worst ever made”, Plan 9 from Outer Space. (The legend is, unfortunately, incorrect, as the few who have seen an even worse stinkeroo from 1966 called Manos: The Hands of Fate can attest.) Documentation, including a survey paper describing the architecture, along with complete source code and a distribution that installs on PCs, can be readily found with a Web search for the phrase ’Plan 9 from Bell Labs’.

The central design challenge the designers attempted to meet in Plan 9 was integrating graphics and ubiquitous networking into a comfortable Unix-like framework. They kept the Unix choice to mediate access to as many system services as possible through a single big file-hierarchy name space. In fact, they improved on it; many facilities that under Unix are accessed through various ad-hoc interfaces like BSD sockets, fcntl(2), and ioctl(2) are in Plan 9 accessed through ordinary read and write operations on special files analogous to device files. For portability and ease of access, almost all device interfaces are textual rather than binary. Most system services (including, for example, the window system) are file servers containing special files or directory trees representing the served resources. By representing all resources as files, Plan 9 turns the problem of accessing resources on different servers into the problem of accessing files on different servers.

Plan 9 combined this more-Unix-than-Unix file model with a new concept: private name spaces. Every user (in fact, every process) can have its own view of the system’s services by creating its own tree of file-server mounts. Some of the file server mounts will have been manually set up by the user, and others automatically set up at login time. So (as the Plan 9 from Bell Labs survey paper points out) “/dev/cons always refers to your terminal device and /bin/date to the correct version of the date command to run, but which files those names represent depends on circumstances such as the architecture of the machine executing date”.

The single most important feature of Plan 9 is that all mounted file servers export the same file-system-like interface, regardless of the implementation behind them. Some might correspond to local file systems, some to remote file systems accessed over a network, some to instances of system servers running in user space (like the window system or an alternate network stack), and some to kernel interfaces. To users and client programs, all these cases look alike.

One of the examples from the Plan 9 survey paper is the way FTP access to remote sites is implemented. There is no ftp(1) command under Plan 9. Instead there is an ftpfs fileserver, and each FTP connection looks like a file system mount. ftpfs automatically translates open, read, and write commands on files and directories under the mount point into FTP protocol transactions. Thus, all ordinary file-handling tools such as ls(1), mv(1) and cp(1) simply work, both underneath the FTP mount point and across the boundaries with the rest of the user’s view of the namespace. The only difference the user (or his scripts and programs) will notice is retrieval speed.

Plan 9 has much else to recommend it, including the reinvention of some of the more problematic areas of the Unix system-call interface, the elimination of superuser, and many other interesting rethinkings. Its pedigree is impeccable, its design elegant, and it exposes some significant errors in the design of Unix. Unlike most efforts at a second system, it produced an architecture that was in many ways simpler and more elegant than its predecessor. Why didn’t it take over the world?

One could argue for a lot of specific reasons—lack of any serious effort to market it, scanty documentation, much confusion and stumbling over fees and licensing. For those unfamiliar with Plan 9, it seemed to function mainly as a device for generating interesting papers on operating-systems research. But Unix itself had previously surmounted all these sorts of obstacles to attract a dedicated following that spread it worldwide. Why didn’t Plan 9?

The long view of history may tell a different story, but in 2003 it looks like Plan 9 failed simply because it fell short of being a compelling enough improvement on Unix to displace its ancestor. Compared to Plan 9, Unix creaks and clanks and has obvious rust spots, but it gets the job done well enough to hold its position. There is a lesson here for ambitious system architects: the most dangerous enemy of a better solution is an existing codebase that is just good enough.

Some Plan 9 ideas have been absorbed into modern Unixes, particularly the more innovative open-source versions. FreeBSD has a /proc file system modeled exactly on that of Plan 9 that can be used to query or control running processes. FreeBSD’s rfork(2) and Linux’s clone(2) system calls are modeled on Plan 9’s rfork(2). Linux’s /proc file system, in addition to presenting process information, holds a variety of synthesized Plan 9-like device files used to query and control kernel internals using predominantly textual interfaces. Experimental 2003 versions of Linux are implementing per-process mount points, a long step toward Plan 9’s private namespaces. The various open-source Unixes are all moving toward systemwide support for UTF-8, an encoding actually invented for Plan 9.3

3 The tale of how UTF-8 was born involves Ken Thompson, Rob Pike, a new Jersey diner, and a frenzied overnight hack <http://www.cl.cam.ac.uk/~mgk25/ucs/utf-8-history.txt>.

It may well be that over time, much more of Plan 9 will work its way into Unix as various portions of Unix’s architecture slide into senescence. This is one possible line of development for Unix’s future.


### 20.3 Problems in the Design of Unix
Plan 9 cleans up Unix, but only really adds one new concept (private namespaces) to its basic set of design ideas. But are there serious problems with those basic design ideas? In Chapter 1 we touched on several issues that Unix arguably got wrong. Now that the open-source movement has put the design future of Unix back in the hands of programmers and technical people, these are no longer decisions we have to live with forever. We’ll reexamine them in order to get a better handle on how Unix might evolve in the future.


#### 20.3.1 A Unix File Is Just a Big Bag of Bytes
A Unix file is just a big bag of bytes, with no other attributes. In particular, there is no capability to store information about the file type or a pointer to an associated application program outside the file’s actual data.

More generally, everything is a byte stream; even hardware devices are byte streams. This metaphor was a tremendous success of early Unix, and a real advance over a world in which (for example) compiled programs could not produce output that could be fed back to the compiler. Pipes and shell programming sprang from this metaphor.

But Unix’s byte-stream metaphor is so central that Unix has trouble integrating software objects with operations that don’t fit neatly into the byte stream or file repertoire of operations (create, open, read, write, delete). This is especially a problem for GUI objects such as icons, windows, and ’live’ documents. Within a classical Unix model of the world, the only way to extend the everything-is-a-byte-stream metaphor is through ioctl calls, a notoriously ugly collection of back doors into kernel space.

Fans of the Macintosh family of operating systems tend to be vociferous about this. They advocate a model in which a single filename may have both data and resource ’forks’, the data fork corresponding to the Unix byte stream and the resource fork being a collection of name/value pairs. Unix partisans prefer approaches that make file data self-describing so that effectively the same sort of metadata is stored within the file.

The problem with the Unix approach is that every program that writes the file has to know about it. Thus, for example, if we want the file to carry type information inside it, every tool that touches it has to take care to either preserve the type field unaltered or interpret and then rewrite it. While this would be theoretically possible to arrange, in practice it would be far too fragile.

On the other hand, supporting file attributes raises awkward questions about which file operations should preserve them. It’s clear that a copy of a named file to another name should copy the source file’s attributes as well as its data—but suppose we cat(1) the file, redirecting the output of cat(1) to a new name?

The answer to this question depends on whether the attributes are actually properties of filenames or are in some magical way bundled with the file’s data as a sort of invisible preamble or postamble. Then the question becomes: Which operations make the properties visible?

Xerox PARC filesystem designs grappled with this problem as far back as the 1970s. They had an ’open serialized’ call that returned a byte stream containing both attributes and content. If applied to a directory, it returned a serialization of the directory’s attributes plus the serialization of all the files in it. It is not clear that this approach has ever been bettered.

Linux 2.5 already supports attaching arbitrary name/value pairs as properties of a filename, but at time of writing this capability is not yet much used by applications. Recent versions of Solaris have a roughly equivalent feature.


#### 20.3.2 Unix Support for GUIs Is Weak
The Unix experience proves that using a handful of metaphors as the basis for a framework is a powerful strategy (recall the discussion of frameworks and shared context in Chapter 13). The visual metaphor at the heart of modern GUIs (files represented by icons, and opened by clicking which invokes some designated handler program, typically able to create and edit these files) has proven both successful and long-lived, exerting a strong hold on users and interface designers ever since Xerox PARC pioneered it in the 1970s.

Despite considerable recent effort, in 2003 Unix still supports this metaphor only poorly and grudgingly—there are lots of layers, few conventions, and only weak construction utilities. A typical reaction from a Unix old hand is to suspect that this reflects deeper problems with the GUI metaphor itself.

I think part of the problem is that we still don’t have the metaphor right. For example, on the Mac I drag a file to the trashcan to delete it, but when I drag it to a disc it gets copied, and can’t drag it to a printer icon to print it because that’s done through the menus. I could go on and on. It’s like files were in OS/360, before Unix came along with its simple (but not too simple), file idea.

—Steve Johnson

We quoted Brian Kernighan and Mike Lesk to similar effect in Chapter 11. But the inquiry can’t stop with indicting the GUI, because with all its flaws there is tremendous demand for GUIs from end users. Supposing we could get the metaphor right at the level of the design of user interactions, would Unix be capable of supporting it gracefully?

The answer is: probably not. We touched on this problem in considering whether the bag-of-bytes model is adequate. Macintosh-style file attributes may help provide the mechanism for richer support of GUIs, but it seems very unlikely that they are the whole answer. Unix’s object model doesn’t include the right fundamental constructs. We need to think through what a really strong framework for GUIs would be like—and, just as importantly, how it can be integrated with the existing frameworks of Unix. This is a hard problem, demanding fundamental insights that have yet to emerge from the noise and confusion of ordinary software engineering or academic research.


#### 20.3.3 File Deletion Is Forever
People with VMS experience, or who remember TOPS-20 often miss these systems’ file-versioning facilities. Opening an existing file for write or deleting it actually renamed it in a predictable way including a version number; only an explicit removal operation on a version file actually erased data.

Unix does without this, at a not inconsiderable cost in user irritation when the wrong files get deleted through a typo or unexpected effects of shell wildcarding.

There does not seem to be any foreseeable prospect that this will change at the operating system level. Unix developers like clear, simple operations that do what the user tells them to do, even if the user’s instructions could amount to commanding “shoot me in the foot”. Their instinct is to say that protecting the user from himself should be done at the GUI or application level, not in the operating system.


#### 20.3.4 Unix Assumes a Static Filesystem
Unix has, in one sense, a very static model of the world. Programs are implicitly assumed to run only briefly, so the background of files and directories can be assumed static during their execution. There is no standard, well-established way to ask the system to notify an application if and when a specified file or directory changes. This becomes a significant issue when writing long-lived user-interface software which wants to know about changes to the background.

Linux has file- and directory-change notification features,4 and some versions of BSD have copied them, but these are not yet portable to other Unixes.

4 Look for F_NOTIFY under fcntl(2).


#### 20.3.5 The Design of Job Control Was Badly Botched
Apart from the ability to suspend processes (in itself a trivial addition to the scheduler which could be made fairly inoffensive) what job control is about is switching a terminal among multiple processes. Unfortunately, it does the easiest part—deciding where keystrokes go—and punts all the hard parts, like saving and restoring the state of the screen, to the application.

A really good implementation of such a facility would be completely invisible to user processes: no dedicated signals, no need to save and restore terminal modes, no need for the applications to redraw the screen at random times. The model ought to be a virtual keyboard that is sometimes connected to the real one (and blocks you if you ask for input when it isn’t connected) and a virtual screen which is sometimes visible on the real one (and might or might not block on output when it’s not), with the system doing the multiplexing in the same way it multiplexes access to the disk, the processor, etc... and no impact on user programs at all.5

5 This paragraph is based on a 1984 analysis by Henry Spencer. He went on to note that job control was necessary and appropriate for POSIX.1 and later Unix standards to consider precisely because it oozes its way into every program, and hence has to be thought about in any application-to-system interface. Hence, POSIX’s endorsement of a misdesign, while proper solutions were “out of scope” and hence were not even considered.

Doing it right would have required the Unix tty driver to track the entire current screen state rather than just maintaining a line buffer, and to know about terminal types at kernel level (possibly with help from a daemon process) so it could do restores properly when a suspended process is foregrounded again. A consequence of doing it wrong is that the Unix kernel can’t detach a session, such as an xterm or Emacs job, from one terminal and reattach it to another (which could be of a different type).

As Unix usage has shifted to X displays and terminal emulators, job control has become relatively less important, and this issue does not have quite the force it once did. It is still annoying that there is no suspend/attach/detach, however; this feature could be useful for saving the state of terminal sessions between logins.

A common open-source program called screen(1) solves several of these problems.6 However, since it has to be called explicitly by the user, its facilities are not guaranteed to be present in every terminal session; also, the kernel-level code that overlaps with it in function has not been removed.

6 There is a project site for screen(1) at http://www.math.fu-berlin.de/~guckes/screen/.


#### 20.3.6 The Unix API Doesn’t Use Exceptions
C lacks a facility for throwing named exceptions with attached data.7 Thus, the C functions in the Unix API indicate errors by returning a distinguished value (usually –1 or a NULL character pointer) and setting a global errno variable.

7 For nonprogrammers, throwing an exception is a way for a program to bail out in the middle of a procedure. It’s not quite an exit because the throw can be intercepted by catcher code in an enclosing procedure. Exceptions are normally used to signal errors or unexpected conditions that mean it would be pointless to try to continue normal processing.

In retrospect, this is the source of many subtle errors. Programmers in a hurry often neglect to check return values. Because no exception is thrown, the Rule of Repair is violated; program flow continues until the error condition manifests as some kind of failure or data corruption later in execution.

The absence of exceptions also means that some tasks which ought to be simple idioms—like aborting from a signal handler on a version with Berkeley-style signals—have to be performed with code that is complex, subject to portability glitches, and bug-prone.

This problem can be (and normally is) hidden by bindings of the Unix API in languages such as Python or Java that have exceptions.

The lack of exceptions is actually an indicator of a problem with larger immediate implications; C’s weak type ontology makes communication between higher-level languages implemented in it problematic. Most of the more modern languages, for example, have lists and dictionaries as primary data types—but, because these don’t have any canonical representation in the universe of C, attempting to pass lists between (say) Perl and Python is an unnatural act requiring a lot of glue.

There are technologies that address the larger problem, such as CORBA, but they tend to involve a lot of runtime translation and be unpleasantly heavyweight.


#### 20.3.7 ioctl(2) and fcntl(2) Are an Embarrassment
The ioctl(2) and fcntl(2) mechanisms provide a way to write hooks into a device driver. The original, historical use of ioctl(2) was to set parameters like baud rate and number of framing bits in a serial-communications driver, thus the name (for ’I/O control’). Later, ioctl calls were added for other driver functions, and fcntl(2) was added as a hook into the filesystem.

Over the years, ioctl and fcntl calls have proliferated. They are often poorly documented, and often a source of portability problems as well. With each one comes a grubby pile of macro definitions describing operation types and special argument values.

The underlying problem is the same as ’big bag of bytes’; Unix’s object model is weak, leaving no natural places to put many auxiliary operations. Designers have an untidy choice among unsatisfactory alternatives; fcntl/ioctl going through devices in /dev, new special-purpose system calls, or hooks through special-purpose virtual file systems that hook into the kernel (e.g., /proc under Linux and elsewhere).

It is not clear whether or how Unix’s object model will be enriched in the future. If MacOS-like file attributes become a common feature of Unix, tweaking magic named attributes on device drivers may take over the role ioctl/fcntl now have (this would at least have the merit of not requiring piles of macro definitions before the interface could be used). We’ve already seen that Plan 9 , which uses the named file server or filesystem as its basic object, rather than the file/bytestream, presents another possible path.


#### 20.3.8 The Unix Security Model May Be Too Primitive
Perhaps root is too powerful, and Unix should have finer-grained capabilities or ACLs (Access Control Lists) for system-administration functions, rather than one superuser that can do anything. People who take this position argue that too many system programs have permanent root privileges through the set-user-ID mechanism; if even one can be compromised, intrusions everywhere will follow.

This argument is weak, however. Modern Unixes allow any given user account to belong to multiple security groups. Through use of the execute-permission and set-group-ID bits on program executables, each group can in effect function as an ACL for files or programs.

This theoretical possibility is very little used, however, suggesting that the demand for ACLs is much less in practice than it is in theory.


#### 20.3.9 Unix Has Too Many Different Kinds of Names
Unix unified files and local devices—they’re all just byte streams. But network devices accessed through sockets have different semantics in a different namespace. Plan 9 demonstrates that files can be smoothly unified with both local and remote (network) devices, and all of these things can be managed through a namespace that is dynamically adjustable per-user and even per-program.


#### 20.3.10 File Systems Might Be Considered Harmful
Was having a file system at all the wrong thing? Since the late 1970s there has been an intriguing history of research into persistent object stores and operating systems that don’t have a shared global filesystem at all, but rather treat disk storage as a huge swap area and do everything through virtualized object pointers.

Modern efforts in this line (such as EROS8) hint that such designs can offer large benefits including both provable conformance to a security policy and higher performance. It must be noted, however, that if this is a failure of Unix, it is equally a failure of all of its competitors; no major production operating system has yet followed EROS’s lead.9

8 http://www.eros-os.org/

9 The operating systems of the Apple Newton, the AS/400 minicomputer and the Palm handheld could be considered exceptions.


#### 20.3.11 Towards a Global Internet Address Space
Perhaps URLs don’t go far enough. We’ll leave the last word on possible future directions of Unix to Unix’s inventor:

My ideal for the future is to develop a filesystem remote interface (a la Plan 9) and then have it implemented across the Internet as the standard rather than HTML. That would be ultimate cool.

—Ken Thompson


### 20.4 Problems in the Environment of Unix
The old-time Unix culture has largely reinvented itself in the open-source movement. Doing so saved us from extinction, but it also means that the problems of open source are now ours as well.

One of these is how to make open-source development economically sustainable. We have reconnected with our roots in the collaborative, open process of Unix’s early days. We have largely won the technical argument for abandoning secrecy and proprietary control. We have thought of ways to cooperate with markets and managers on more equal terms than we ever could in the 1970s and 1980s, and in many ways our experiments have succeeded. In 2003 the open-source Unixes, and their core development groups, have achieved a degree of mainstream respectability and authority that would have been unimaginable as recently as the mid-1990s.

We have come a long way. But we have a long way to go yet. We know what business models might work in theory, and now we can even point at a sporadic handful of successes that demonstrate that they work in practice; now we have to show that they can be made to work reliably over a longer term.

It’s not necessarily going to be an easy transition. Open source turns software into a service industry. Service-provider firms (think of medical and legal practices) can’t be scaled up by injecting more capital into them; those that try only scale up their fixed costs, overshoot their revenue base, and starve to death. The choices come down to singing for your supper (getting paid through tips and donations), running a corner shop (a small, low-overhead service business), or finding a wealthy patron (some large firm that needs to use and modify open-source software for its business purposes).

In total, the amount of money spent to hire software developers can be expected to rise, for the same reasons that mechanics’ hourly wages go up as the price of automobiles drops.10 But it is going to become more difficult for any one individual or firm to capture a lot of that spending. There will be many programmers who are well off, but fewer millionaires. This is actually a sign of progress, of inefficiencies being competed out of the system. But it will represent a big change in climate, and probably means that investors will lose what little interest they have left in funding software startups.

10 For a more complete discussion of this effect, see The Magic Cauldron in [Raymond01].

One important subproblem related to the increasing difficulty of sustaining really large software businesses is how to organize end-user testing. Historically, the Unix culture’s concentration on infrastructure has meant that we have not tended to build programs that depended for their value on providing a comfortable interface for end-users. Now, especially in the open-source Unixes that aim to compete directly with Microsoft and Apple, that is changing. But end-user interfaces need to be systematically tested with real end users—and therein lie some challenges.

Real end-user testing demands facilities, specialists, and a level of monitoring that are difficult for the distributed volunteer groups characteristic of open-source development to arrange. It may be, therefore, that open-source word processors, spreadsheets, and other ’productivity’ applications have to be left in the hands of large corporate-sponsored efforts like OpenOffice.org that can afford the overhead. Open-source developers consider single corporations to be single points of failure and worry about such dependencies, but no better solution has yet evolved.

These are economic problems. We have other problems of a more political nature, because success makes enemies.

Some are familiar. Microsoft’s ambition for an unchallengeable monopoly lock on computing made the defeat of Unix a strategic goal for the company in the mid-1980s, five years before we knew we were in a fight. In mid-2003, despite having had several growth markets it was counting on largely usurped by Linux, Microsoft is still the wealthiest and most powerful software company in the world. Microsoft knows very well that it must defeat the new-school Unixes of the open-source movement to survive. To defeat them, it must destroy or discredit the culture that produced them.

Unix’s comeback in the hands of the open-source community, and its association with the freewheeling culture of the Internet, has made it newer enemies as well. Hollywood and Big Media feel deeply threatened by the Internet and have launched a multipronged attack on uncontrolled software development. Existing legislation like the Digital Millennium Copyright Act has already been used to prosecute software developers who were doing things the media moguls disliked (the most notorious cases, of course, involve the DeCSS software that enables copying of encypted DVDs). Contemplated schemes like the so-called Trusted Computing Platform Alliance and Palladium threaten11 to make open-source development effectively illegal—and if open source goes down, Unix is very likely to go down with it.

11 See the TCPA FAQ <http://www.cl.cam.ac.uk/~rja14/tcpa-faq.html> for a rather hair-raising summary of the possibilities by a noted security specialist.

Unix and the hackers and the Internet against Microsoft and Hollywood and Big Media. It’s a struggle we need to win for all our traditional reasons of professionalism, allegiance to our craft, and mutual tribal loyalty. But there are larger reasons this struggle is important. The possibilities of politics are increasingly shaped by communication technology—who can use it, who can censor it, who can control it. Government and corporate control of the content of the nets, and of what people can do with their computers, is a severe long-term threat to political freedom. The nightmare scenario is one in which corporate monopolism and statist power-seeking, always natural allies, feed back into each other and create rationales for increasing regulation, repression, and criminalization of digital speech. In opposing this, we are the warriors of liberty—not merely our own liberty, but everyone else’s as well.


### 20.5 Problems in the Culture of Unix
Just as important as the technical problems with Unix itself and the challenges consequent on its success are the cultural problems of the community around it. There are at least two serious ones: a lesser challenge of internal transition, and a greater one of overcoming our historical elitism.

The lesser challenge is that of friction between the old-school Unix gurus and the new-school open-source crowd. The success of Linux, in particular, is not an entirely comfortable phenomenon for a lot of older Unix programmers. This is partly a generational problem. The raucous energy, naïvete and gleeful zealotry of the Linux kids sometimes grates on elders who have been around since the 1970s and (often rightly) consider themselves wiser. It’s only exacerbated by the fact that the kids are succeeding where the elders failed.

The greater problem of psychology only became clear to me after spending three days at a Macintosh developer conference in 2000. It was a very enlightening experience to be immersed in a programming culture with assumptions diametrically opposed to those of the Unix world.

Macintosh programmers are all about the user experience. They’re architects and decorators. They design from the outside in, asking first “What kind of interaction do we want to support?” and then building the application logic behind it to meet the demands of the user-interface design. This leads to programs that are very pretty and infrastructure that is weak and rickety. In one notorious example, as late as Release 9 the MacOS memory manager sometimes required the user to manually deallocate memory by manually chucking out exited but still-resident programs. Unix people are viscerally revolted by this kind of maldesign; they don’t understand how Macintosh people could live with it.

By contrast, Unix people are all about infrastructure. We are plumbers and stonemasons. We design from the inside out, building mighty engines to solve abstractly defined problems (like “How do we get reliable packet-stream delivery from point A to point B over unreliable hardware and links?”). We then wrap thin and often profoundly ugly interfaces around the engines. The commands date(1), find(1), and ed(1) are notorious examples, but there are hundreds of others. Macintosh people are viscerally revolted by this kind of maldesign; they don’t understand how Unix people can live with it.

Both design philosophies have some validity, but the two camps have a great deal of difficulty seeing each other’s points. The typical Unix developer’s reflex is to dismiss Macintosh software as gaudy fluff, eye-candy for the ignorant, and to continue building software that appeals to other Unix developers. If end-users don’t like it, so much the worse for the end users; they will come around when they get a clue.

In many ways this kind of parochialism has served us well. We are the keepers of the Internet and the World Wide Web. Our software and our traditions dominate serious computing, the applications where 24/7 reliability and minimal downtime is a must. We really are extremely good at building solid infrastructure; not perfect by any means, but there is no other software technical culture that has anywhere close to our track record, and it is one to be proud of.

The problem is that we increasingly face challenges that demand a more inclusive view. Most of the computers in the world don’t live in server rooms, but rather in the hands of those end users. In early Unix days, before personal computers, our culture defined itself partly as a revolt against the priesthood of the mainframes, the keepers of the big iron. Later, we absorbed the power-to-the-people idealism of the early microcomputer enthusiasts. But today we are the priesthood; we are the people who run the networks and the big iron. And our implicit demand is that if you want to use our software, you must learn to think like us.

In 2003, there is a deep ambivalence in our attitude—a tension between elitism and missionary populism. We want to reach and convert the 92% of the world for whom computing means games and multimedia and glossy GUI interfaces and (at their most technical) light email and word processing and spreadsheets. We are spending major effort on projects like GNOME and KDE designed to give Unix a pretty face. But we are still elitists at heart, deeply reluctant and in many cases unable to identify with or listen to the needs of the Aunt Tillies of the world.

To nontechnical end users, the software we build tends to be either bewildering and incomprehensible, or clumsy and condescending, or both at the same time. Even when we try to do the user-friendliness thing as earnestly as possible, we’re woefully inconsistent at it. Many of the attitudes and reflexes we’ve inherited from old-school Unix are just wrong for the job. Even when we want to listen to and help Aunt Tillie, we don’t know how—we project our categories and our concerns onto her and give her ’solutions’ that she finds as daunting as her problems.

Our greatest challenge as a culture is whether we can outgrow the assumptions that have served us so well—whether we can acknowledge, not merely intellectually but in the sinew of daily practice, that the Macintosh people have a point. Their point is made in more general, less Mac-specific way in The Inmates Are Running the Asylum [Cooper], an insightful and argumentative book about what its author calls interaction design that (despite occasional crotchets) contains a good deal of hard truth that every Unix programmer ought to know.

We can turn aside from this; we can remain a priesthood appealing to a select minority of the best and brightest, a geek meritocracy focused on our historical role as the keepers of the software infrastructure and the networks. But if we do this, we will very likely go into decline and eventually lose the dynamism that has sustained us through decades. Someone else will serve the people; someone else will put themselves where the power and the money are, and own the future of 92% of all software. The odds are, whether that someone else is Microsoft or not, that they will do it using practices and software we don’t much like.

Or we can truly accept the challenge. The open-source movement is trying hard to do so. But the kind of sustained work and intelligence we have brought to other problems in the past will not alone suffice. Our attitudes must change in a fundamental and difficult way.

In Chapter 4 we discussed the importance of throwing away limiting assumptions and discarding the past in solving technical problems, suggesting a parallel with the Zen ideas of detachment and ’beginner’s mind’. We have a larger kind of detachment to work on now. We must learn humility before Aunt Tillie, and relinquish some of the long-held prejudices that have made us so successful in the past.

Tellingly, the Macintosh culture has begun to converge with ours—MacOS X has Unix underneath, and in 2003 Mac developers are (albeit with a struggle in some cases) making the mental adjustment to learn the infrastructure-focused virtues of Unix. Our challenge will be, reciprocally, to embrace the user-centered virtues of the Macintosh.

There are other signs that the Unix culture is shedding its insularity as well. One is the convergence that seems to be going on between the Unix/open-source community and the movement called “agile programming”.12 We noted in Chapter 4 that Unix programmers have seized happily on the concept of refactoring, one of the preoccupations of the agile-programming thinkers. Refactoring, and other agile concepts like unit-testing and design around stories, seem to articulate and sharpen practices that have heretofore been widespread but only implicit in the Unix tradition. The Unix tradition, on the other hand, can bring groundedness and the lessons of long experience to the agile-programming party. As open-source software gains market share it is even conceivable that these cultures will fuse, much as the old-time Internet and early Unix cultures did after 1980.

12 For an introduction to agile programming, see the Agile Manifesto <http://agilemanifesto.org/>


### 20.6 Reasons to Believe
The future of Unix is full of difficult problems. Would we truly want it any other way?

For more than thirty years we have thrived on challenges. We pioneered the best practices of software engineering. We created today’s Internet and Web. We have built the largest, most complex, and most reliable software systems ever to exist. We outlasted the IBM monopoly and we’re making a run against the Microsoft monopoly that is good enough to deeply frighten it.

Not that everything has been triumph by any means. In the 1980s we nearly destroyed ourselves by acceding to the proprietary capture of Unix. We neglected the low end, the nontechnical end users, for far too long and thereby left Microsoft an opening to grossly lower the quality standards of software. Intelligent observers have pronounced our technology, our community, and our values to be dead any number of times.

But always we have come storming back. We make mistakes, but we learn from our mistakes. We have transmitted our culture across generations; we have absorbed much of what was best from the early academic hackers and the ARPANET experimenters and the microcomputer enthusiasts and a number of other cultures. The open-source movement has resurrected the vigor and idealism of our early years, and today we are stronger and more numerous than we have ever been.

So far, betting against the Unix hackers has always been short-term smart but long-term stupid. We can prevail—if we choose to.