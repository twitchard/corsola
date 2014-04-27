/* This script is called whenever the user navigates to the W&L
Course offerings page. */
/* There is a table in the course offerings page. Each row corresponds
to one course. This code makes a new "preferred courses" table. The
table appears above the course offerings table. The user can click on
a table row to move it back and forth from the "course offerings" and 
the "preferred courses" table. */

/*These are the hard-coded locations inside the DOM we need to know
about to insert our new elements and gather information. */
grid = document.querySelector("#ApplicationContentPlaceHolder_CoGridView > tbody");
rows = document.querySelectorAll("#ApplicationContentPlaceHolder_CoGridView > tbody > tr");
insertContainer = document.querySelector("#ApplicationContentPlaceHolder_ScrollPanel");
insertLocation = document.querySelector("#ApplicationContentPlaceHolder_CoPanel");
subjects = []
types = []
fdrs = []
schedules = []
facultys = []
buildings = []

    for (var i = 1; i < rows.length; i++) {
        types[i] = rows[i].children[0].textContent;
        fdrs[i] = rows[i].children[4].textContent;
        schedules[i] = rows[i].children[8].innerText.trim().split("\n");
        facultys[i] = rows[i].children[5].innerText.trim().split("\n");
        if (rows[i].length > 9) {
            var building = rows[i].children[9].innerText.trim().split(" ");
            if (building.length > 0) {
                buildings[i] = building[0]
            }
        }

    }
/* Constructs the preferred courses table and a wrapper Div */
var preferredTable = document.createElement("table");
/*These styles were copied from the existing course offerings table*/
preferredTable.setAttribute("cellspacing", "0");
preferredTable.setAttribute("cellpadding", "2");
preferredTable.setAttribute("rules", "all");
preferredTable.setAttribute("border", "1");
var newDiv = document.createElement("div");
var heading = document.createElement("h2");
heading.appendChild(document.createTextNode("Preferred Courses"));
newDiv.appendChild(heading);
button = document.createElement("input");
button.setAttribute("type", "button");
button.setAttribute("value", "Visualize");
button.onclick = function () {visualize()};
newDiv.appendChild(button);
newDiv.appendChild(preferredTable);
insertContainer.insertBefore(newDiv, insertLocation)



/* Put placeholders in between each row of the course offerings table
so that order is preserved when the rows are switching back and forth. */
placeHolders = [];
/* For each course there are two functions--one which switches it out
of the course offerings and into the preferred courses table, and
one the other way. These arrays keep track of them. */
switchOut = [];
switchIn = [];
selectButton = [];
var selectHeading = document.createElement("th");
var headingText = document.createTextNode("Select");
selectHeading.appendChild(headingText);
rows[0].appendChild(selectHeading);
for (var i = 1; i < rows.length; i++) {
     $(rows[i]).data("id", i)
	placeHolders[i] = document.createElement("span");
	placeHolders[i].style.display = "none";
	rows[i].parentElement.insertBefore(placeHolders[i],rows[i]);
     var selectCell = document.createElement("td");
     selectButton[i] = document.createElement("input");
     selectButton[i].setAttribute("type", "button");
     selectButton[i].setAttribute("value", "Choose");
     rows[i].appendChild(selectCell);
     selectCell.appendChild(selectButton[i]);
	(function(i) {
	switchOut[i] = function () {
          $(rows[i]).data("chosen", true);
		preferredTable.appendChild(rows[i])
	     selectButton[i].onclick = switchIn[i];
          selectButton[i].setAttribute("value", "Unchoose");
	};
	switchIn[i] = function () {
	   $(rows[i]).data("chosen", false);
        grid.insertBefore(rows[i], placeHolders[i]);
		selectButton[i].onclick = switchOut[i];
          selectButton[i].setAttribute("value", "Choose");
	};
     selectButton[i].onclick = switchOut[i];
	})(i);
	
}
filters = document.getElementsByTagName("select");
newfilters = []
filterFunctions = [];

filterFunctions[1] = function(i) {
    return filters[1].value == "-Any-" || 
           types[i].indexOf(filters[1].value.trim().split(" ")[0]) != -1
           
                
}

filter = function() {
    
    for (i = 1; i < rows.length; i++)
    {
        if (filterFunctions[1](i)) {
            rows[i].style.display = "none"
        }
        else {
            rows[i].style.display = "table-row"
        }
    }
}
/*
for (i = 1; i < filters.length; i++) {
    newfilters[i] = $("<select class = \"highlight\"></select>")[0];
    filters[i].parentElement.insertBefore(newfilters[i],filters[i]);
    for (var j = 0; j < children.length; j++) {
        newfilters[i].appendChild(filters[i].children[j]);
    }
    filters[i].parentElement.removeChild(filters[i]);
    newfilters[i].onchange = function () {
        filter();
    }
}
*/
/* This function is called when the visualize button in the preferred
courses div is pressed. It hides the original course offerings and
preferred courses list, and replaces it with the course selection ui.
It also loads the function and class definitions necessary for the
course selection functionality. */

visualize = function() {
    Conflict = function (time1, time2) {
    	if (!time1.conflictsWith(time2)) {
    		this.invalid = true;
    		return null;
    	}
    	this.invalid = false;
    	this.start = Math.max(time1.start, time2.start);
    	this.end = Math.min(time1.end, time2.end);
    	this.day = time1.day;
    	this.display = new ConflictDisplay(this);
    	return this;
    }
    ConflictDisplay = function(conflict) {
    	var display = $('<div/>');
    	display.css('top', (conflict.start - BEGIN_TIME) * MINUTE_HEIGHT + 'px');
    	display.css('height', (conflict.end - conflict.start) * MINUTE_HEIGHT
    			+ 'px');
    	display.css('display', 'none');
    	display.addClass('conflict');
    	dayDiv[conflict.day].append(display);
    	conflict.display = display;
    	return display;
    }
    Time = function(day, start, end, course) {
    	/* Time object. */
    	this.id = nextTimeId();
    	timeMap[this.id] = this;
    	timeList.push(this.id);
    	this.day = day;
    	this.start = start;
    	this.end = end;
    	this.display = new TimeDisplay(this);
    	this.deselect = function() {
    		this.display.stop().fadeOut('fast');
    	};
    	this.select = function() {
    		this.display.stop().fadeIn('fast');
    	};
    	this.pretty = prettyTime(start) + "-" + prettyTime(end);
    	this.endsBefore = function(time) {
    		return this.end < time.start;
    	};
    	this.startsBefore = function(time) {
    		return this.start < time.start;
    	};
    	this.conflictsWith = function(time) {
    		if (time.day != this.day) {
    			return false;
    		}
    		if (time.start < this.start && time.end < this.start) {
    			return false;
    		}
    		if (this.start < time.start && this.end < time.start) {
    			return false;
    		}
    		return true;

    	};
    	this.setCourse = function(course) {
    		this.course = course;
    		this.display.css('background-color', course.color);
    		this.display.append(this.display.append("<span>" + course.identifier
    				+ "</span>"));
    	};
    	this.getConflictsWithSelected = function() {
    		var conflicts = [];
    		for (i in selectedCourses) {
    			var course = selectedCourses[i];
    			for (j in course.times) {
    				var conflict = new Conflict(this, course.times[j]);
    				if (!conflict.invalid) {
    					conflicts.push(conflict);
    				}
    			}
    		}
    		return conflicts;
    	};
    }
    TimeDisplay = function(time) {
    	var display = $('<div/>');
    	display.css('position', 'absolute');
    	display.css('top', (time.start - BEGIN_TIME) * MINUTE_HEIGHT + 'px');
    	display.css('height', (time.end - time.start) * MINUTE_HEIGHT + 'px');
    	display.addClass('timeDisplay');
    	dayDiv[time.day].append(display);
    	time.display = display;
    	time.display.css("display", "none");
    	return display;
    }
    Course = function(id, department, number, section, title, times) {
    	this.selected = false;
    	this.id = id;
    	this.department = department;
    	this.number = number;
    	this.section = section;
    	this.title = title;
    	this.identifier = this.department + "-" + this.number + "-" + this.section;
    	this.color = nextColor();
    	this.times = [];
    	this.display = new CourseDisplay(this);
    	this.addTime = function(time) {
    		time.setCourse(this);
    		if (time.day != "Z" && this.times.length == 0) {
    			$('#preferred').append(this.display);
    		}
    		this.times.push(time);
    	};
    	this.addPrettyTimes = function() {
    		this.display
    				.append($('<span>' + prettyTimeList(this.times) + '</span>'));
    	};
    	for (i in times) {
    		this.addTime(times[i]);
    	}
    	this.getConflictsWithSelected = function() {
    		var conflicts = [];
    		for (i in this.times) {
    			var conflictList = this.times[i].getConflictsWithSelected();
    			for (j in conflictList) {
    				if (conflictList[j] != null) {
    					conflicts.push(conflictList[j]);
    				}
    			}
    		}
    		return conflicts;
    	};
    	this.select = function() {
    		var conflicts = this.getConflictsWithSelected();
    		if (conflicts.length == 0) {
    			this.display.addClass('selectedCourseDisplay');
    			this.selected = true;
    			document.getElementById(this.id).checked = true;
    			for (i in this.times) {
    				this.times[i].select();
    			}
    			selectedCourses.push(this);
    		}
    		updateConflictedCourses();
    	};
    	this.deselect = function() {
    		this.display.removeClass('selectedCourseDisplay');
    		this.selected = false;
    		document.getElementById(this.id).checked = false;
    		for (i in this.times) {
    			this.times[i].deselect();
    		}
    		selectedCourses.pop(selectedCourses.indexOf(this));
    		updateConflictedCourses();
    	};
    	this.disable = function() {
    		this.conflictsWithSelected = true;
    		this.display.addClass("conflictedCourseDisplay");
    	};
    	this.enable = function() {
    		this.conflictsWithSelected = false;
    		this.display.removeClass("conflictedCourseDisplay");
    	};
    	this.checkForConflicts = function() {
    		if (!this.selected) {
    			var conflict = false;
    			for (i in this.times) {
    				if (this.times[i].getConflictsWithSelected().length > 0) {
    					conflict = true;
    				}
    			}
    			if (conflict == true) {
    				this.disable();
    			}
    			else {
    				this.enable();
    			}
    		}
    	};
    }
    CourseDisplay = function(course) {
    	var display = $('<div></div>');
    	display.data("id", course.id);
    	display.css('background-color', course.color);
    	display.css('border-color', course.color);
    	display.addClass("courseDisplay");
    	display.addClass("unattachedCourseDisplay");
    	display.append($('<span>' + course.identifier + '</span><br/>'));
    	display.append($('<span>' + course.title + '</span>'));
    	display.append($('<br/>'));
    	display
    			.append($("<input type=\"checkbox\" style=\"visibility:hidden;\" \
    		name=\"courses\" id="
    					+ course.id + " value=" + course.id + " />"));
    	display.draggable({
    		revert : true,
    		axis : 'y',
    		stack : '.courseDisplay',
    	});
    	display.droppable({
    		hoverClass : 'hungryCourseDisplay',
    		accept : function(draggable) {
    			return courseMap[draggable.data("id")].group == null;
    		},
    		drop : function(event, ui) {
    			
    			group = new Group(ui.draggable
    					.data("id"), $(this).data("id"));
    		}

    	});
    	display.data("toggleSelect", function() {
    		if (course.selected) {
    			course.deselect();
    		} else {
    			course.select();
    		}
    	}); 
    	display.on("click", display.data("toggleSelect"));
    	display.on("mouseenter", function() {
    		if (!course.selected) {
    			for (i in course.times) {
    				course.times[i].display.stop(true, true).fadeIn('fast');
    			}
    			course.conflicts = course.getConflictsWithSelected();
    			for (i in course.conflicts) {
    				course.conflicts[i].display.stop(true, true).fadeIn('fast');
    			}
    		}
    	});
    	display.on("mouseleave", function() {
    		if (!course.selected) {
    			for (i in course.times) {
    				course.times[i].display.stop(true, true).fadeOut('fast');
    			}
    			for (i in course.conflicts) {
    				course.conflicts[i].display.stop(true, true).fadeOut('fast');
    			}
    			course.conflicts = [];

    		}
    	});

    	course.display = display;
    	return display;
    }
    Group = function(course1id, course2id) {
    	var course1 = courseMap[course1id];
    	var course2 = courseMap[course2id];
    	course1.group = this;
    	course2.group = this;
    	course1.deselect();
    	course2.deselect();
    	this.activeCourse = null;
    	this.courses = [];
    	this.courses.push(course1);
    	this.courses.push(course2);
    	this.color = nextColor();
    	this.display = new GroupDisplay(this);
    	course1.display.addClass("groupedCourseDisplay");
    	course2.display.addClass("groupedCourseDisplay");
    	course1.display.droppable("disable");
    	course2.display.droppable("disable");
    	course1.display.off('click');
    	course2.display.off('click');
    	this.display.insertAfter(course1.display);
    	this.display.append(course1.display.detach());
    	this.display.append(course2.display.detach());
    	this.removeCourse = function(course) {
    		course.group = null;
    		course.display.data("group", null);
    		this.courses.splice(this.courses.indexOf(course), 1);
    		course.display.droppable("enable");
    		course.display.on('click', course.display.data('toggleSelect'));
    		course.display.removeClass("groupedCourseDisplay");
    		course.display.detach().insertAfter(this.display);
    		if (this.courses.length == 1) {
    			groups.splice(groups.indexOf(this), 1);
    			this.removeCourse(this.courses[0]);
    			this.display.remove();
    		}
    	};
    	this.findActiveCourse = function() {
    		updateConflictedCourses();
    		var foundConflictFreeCourse = false;
    		for (i in this.courses) {
    			if (!this.courses[i].conflictsWithSelected) {
    				foundConflictFreeCourse = true;
    				this.setActiveCourse(this.courses[i]);
    				return true;
    			}
    		}
    		if (foundConflictFreeCourse == false) {
    			this.activeCourse = null;
    			return false;
    		}
    	};
    	this.setActiveCourse = function(course) {
    		this.activeCourse = course;
    		for (i in this.courses) {
    			this.courses[i].display.removeClass("activeCourseDisplay");
    		}
    		course.display.addClass("activeCourseDisplay");
    	};
    	this.findActiveCourse();
    	groups.push(this);
    }
    GroupDisplay = function(group) {
    	var display = $('<div></div>');
    	display.data("group", group);
    	display.css('background-color', group.color);
    	display.css('border-width', 'thick');
    	display.css('border-color', group.color);
    	display.addClass("groupDisplay");
    	display.droppable({
    		accept : function(draggable) {
    			return courseMap[draggable.data("id")].group == null;
    		},
    		drop : function(event, ui) {
    			ui.draggable.addClass('groupedCourseDisplay');
    			courseMap[ui.draggable
    						.data("id")].group = $(this).data("group");
    			ui.draggable.droppable("disable");
    			$(this).append(ui.draggable.detach());
    			$(this).data("group").courses.push(courseMap[ui.draggable
    					.data("id")]);
    			
    		}
    	});
    	group.display = display;

    	return display;
    }




    updateConflictedCourses = function () {
    	var displayedCourses = $('.courseDisplay');
    	displayedCourses.each(function(i) {
    		courseMap[$(displayedCourses[i]).data("id")].checkForConflicts();
    	});
    }

    updateActiveCourses = function() {
    	
    }
    groups = [];

    /*
     * Set the div which contains the course displays to accept grouped courses that
     * you drop somewhere inside.
     */

    readyFunction = function() {
    	$('#preferred').droppable(
    			{
    				accept : function(draggable) {
    					return courseMap[draggable.data("id")].group != null;
    				},
    				drop : function(event, ui) {
    					courseMap[ui.draggable.data("id")].group
    							.removeCourse(courseMap[ui.draggable.data("id")]);
    					/*This is a really ugly workaround for a bug that was causing grouping
    					 * to fail after any group had been disbanded.
    					 */
    					$('#preferred').droppable('destroy'); 
    					readyFunction();				}
    			});
    };
    $(document).ready(readyFunction);
    /* Each time is given an id. For efficient conflict detection, the time
     * ids are kept in two sorted lists--one according to end-times of the
     * time-blocks, and one according to the beginning. */
    timeId = 0;
    timeMap = {};
    timeList = [];
    nextTimeId = function() {
    	timeId++;
    	return timeId;
    }
    function prettyTimeList(times) {
    	/*
    	 * Takes a list of timeBlocks and turns it into a prettified string
    	 * representation. Really clunky. Almost certainly a better way to do this
    	 * exists.
    	 */
    	blocks = [];
    	ret = "";
    	for (i in times) {
    		found = false;
    		for (j in blocks) {
    			if (blocks[j][0][0] == times[i].start
    					&& blocks[j][0][1] == times[i].end) {
    				blocks[j][1][times[i].day] = times[i].day;
    				found = true;
    			}
    			break;
    		}
    		if (found == false) {
    			entry = [ [ times[i].start, times[i].end ], {
    				"M" : "",
    				"T" : "",
    				"W" : "",
    				"R" : "",
    				"F" : ""
    			} ];
    			entry[1][times[i].day] = times[i].day;
    			blocks.push(entry);

    		}
    	}
    	for (i in blocks) {
    		ret += "<span class = 'daylist'>";
    		ret += blocks[i][1]["M"];
    		ret += blocks[i][1]["T"];
    		ret += blocks[i][1]["W"];
    		ret += blocks[i][1]["R"];
    		ret += blocks[i][1]["F"];
    		ret += "</span> ";
    		ret += prettyTime(blocks[i][0][0]);
    		ret += "-";
    		ret += prettyTime(blocks[i][0][1]);
    		if (i != blocks.length) {
    			ret += "<br/>";
    		}
    	}
    	return ret;
    }
    function prettyTime(time) {
    	hour = Math.floor(time / 60);
    	minute = time % 60;
    	if (hour < 12) {
    		meridian = "am";
    	} else {
    		hour %= 12;
    		meridian = "pm";
    	}
    	if (hour == 0) {
    		hour = 12;
    	}
    	if (minute < 10) {
    		minute = "0" + minute;
    	}
    	return hour + ":" + minute + meridian;
    }
    /*
    This code is excerpted from
    TinyColor v0.9.16 https://github.com/bgrins/TinyColor 2013-08-10, 
    Brian Grinstead, MIT License
    */

    isOnePointZero = function (n) {
        return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
    }

    isPercentage = function(n) {
        return typeof n === "string" && n.indexOf('%') != -1;
    }

    mathMin = Math.min;
    mathMax = Math.max;
    bound01 = function(n, max) {
        if (isOnePointZero(n)) { n = "100%"; }

        var processPercent = isPercentage(n);
        n = Math.min(max, Math.max(0, parseFloat(n)));

        if (processPercent) {
            n = parseInt(n * max, 10) / 100;
        }
        
        if ((Math.abs(n - max) < 0.000001)) {
            return 1;
        }
            return (n % max) / parseFloat(max);
    }



    hsvToRgb = function(h, s, v) {

        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);

        var i = Math.floor(h),
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6,
            r = [v, q, p, p, t, v][mod],
            g = [t, v, v, q, p, p][mod],
            b = [p, p, t, v, v, q][mod];

        return { r: r * 255, g: g * 255, b: b * 255 };
    }
    generateColorList = function(n) {
        var ret = []
        for (var i = 0; i < n; i++) {
            var hue = (((i) / n) % 1 ) * 360;
            var saturation = .5 * 100;
            var brightness = .9 * 100;
            var color = hsvToRgb(hue, saturation, brightness);
            ret[i] = "rgb(" + Math.floor(color.r) + "," + Math.floor(color.g) + "," + Math.floor(color.b) + ")";
        }
        return ret;
    }
    /* The TimeDisplays are color-coordinated with their corresponding
     * CourseDisplays. Color selection is handled for now by a 
     * colors array, and a nextColor function which cycles through the
     * array. */
    colors = generateColorList(preferredTable.childNodes.length);
    //colors = ["red", "blue", "yellow"];
    colorindex = 0;
    nextColor = function() {
    	var color = colors[colorindex % colors.length];
    	colorindex += 1;
    	return color;
    }
    selectedCourses = [];
    courses = [];
    courseMap = {};
    courseOfferingsBody = $('body')[0]
    courseOfferingsHead = $('head')[0]
    page = courseOfferingsBody.parentElement
    page.removeChild(courseOfferingsBody)
    page.removeChild(courseOfferingsHead)
    /* 
     * Positions of the TimeDisplay objects are calculated according to
     * three constants: TOTAL_HEIGHT (total height of the schedule in pixels)
     * BEGIN_TIME, the number of minutes from 12:00 AM of the first minute
     * that should be displayed on the schedule, and END_TIME, the number of
     * minutes from 12:00 of the last minute that should be displayed on the
     * schedule.
     */
    BEGIN_TIME = 60*8;
    TOTAL_HEIGHT = 500;
    END_TIME = 60*17; 
    MINUTE_HEIGHT = TOTAL_HEIGHT / (END_TIME - BEGIN_TIME);

    visualHead = $("<head></head>")[0];
    visualBody = $("<body></body>")[0];

    visualHead.appendChild($("<link rel='stylesheet' type='text/css' " + 
                    "href='" + chrome.extension.getURL("selection.css") 
                    + "' />")[0]);

    $(visualBody).load(chrome.extension.getURL("visualizer.html"), "", 
        function (responseText, textStatus, XMLHttpRequest) {
            dayDiv = {
            		"M" : $('#monday'),
            		"T" : $('#tuesday'),
            		"W" : $('#wednesday'),
            		"R" : $('#thursday'),
            		"F" : $('#friday'),
            		"Z" : $('<div/>') /* For undefined days */
            	};

            preferredDiv = $('#preferred');
                

            $('#scheduleContainer').css("height",TOTAL_HEIGHT);
            $('#scheduleContainer').css("width",TOTAL_HEIGHT*1.4);
            $('#times').css("height",TOTAL_HEIGHT);
            $('.day').css("height",TOTAL_HEIGHT);
            $('.time').css("height",MINUTE_HEIGHT*60);
            textTimeToMinutes = function(s) {
                var meridian = s.charAt(s.length - 1);
                var sParts = s.split(":");
                var hour = parseInt(sParts[0]);
                var minute = parseInt(sParts[1].slice(0, sParts[1].length - 1));
                if (meridian == "p" && hour != 12) {
                    hour = hour + 12;
                }
                if (meridian == "a" && hour == 12) {
                    hour = 0;
                }
                return hour * 60 + minute;
            }
            populate = function() {
                var selections = preferredTable.childNodes;
                for (var i = 0; i < selections.length; i++) {
                    var identifier = selections[i].children[1].textContent;
                    var identifierParts = identifier.split("-");
                    var department = identifierParts[0];
                    var number = identifierParts[1];
                    var section = identifierParts[2];
                    var title = selections[i].children[2].textContent;
                    var timeBlocks = selections[i].children[8].innerText.trim().split("\n");
                    courseMap[$(selections[i]).data("id")] = new Course($(selections[i]).data("id"), department, number, section, title);
                    courses[i] = $(selections[i]).data("id");
                    for (var j = 0; j < timeBlocks.length; j++) {
                        var timeBlockParts = timeBlocks[j].split(" ");
                        if (timeBlockParts.length > 1) {
                            var days = timeBlockParts[0];
                            var times = timeBlockParts[1].split("-");
                            for (var k = 0; k < days.length; k++) {
                                courseMap[$(selections[i]).data("id")].addTime(new Time(days[k], 
                                                    textTimeToMinutes(times[0]), 
                                                    textTimeToMinutes(times[1])));
                                                        
                            }
                        }
                        
                    }
                    courseMap[$(selections[i]).data("id")].addPrettyTimes();
                    
                }
            }
            populate();
            $('#goBackButton')[0].onclick = function() {visualize()};
        }
                   );
    page.appendChild(visualHead);
    page.appendChild(visualBody);



    showCourseOfferings = function() {
        page.removeChild(visualHead);
        page.removeChild(visualBody);
        page.appendChild(courseOfferingsHead);
        page.appendChild(courseOfferingsBody);
        visualize = function() {showVisualize()}
    }
    showVisualize = function() {
        page.removeChild(courseOfferingsHead);
        page.removeChild(courseOfferingsBody);
        page.appendChild(visualHead);
        page.appendChild(visualBody);
        oldSelectedCourses = [].concat(selectedCourses);

        for (var i = 0; i < selectedCourses.length; i++) {
            selectedCourses[i].deselect();
        }
        timeId = 0;
        timeMap = {};
        timeList = [];
        selectedCourses = [];
        courses = [];
        groups = [];
        $("#preferred").empty()
        $(".day").empty()


        populate();
        for (var i = 0; i < oldSelectedCourses.length; i++) {
            if ($(rows[oldSelectedCourses[i].id]).data("chosen")) {
                courseMap[oldSelectedCourses[i].id].select();
            }
        }
        visualize = function() {showCourseOfferings()}
    }
    visualize = function() {showCourseOfferings()}

}



