<@cmutil.initialize bean=self initializer="epgInitialiser"/>

<#assign epgServices = wcms.getRequestAttribute("epgServices")!"" />
<#assign epgBroadcastEvents = wcms.getRequestAttribute("epgBroadcastEvents")!"" />
<#assign epgPrograms = wcms.getRequestAttribute("epgPrograms")!"" />
<#assign epgThumbnails = wcms.getRequestAttribute("epgThumbnails")!"" />
<#assign epgClassifType = wcms.getRequestAttribute("classifType")!"" />
<#assign epgDateCurrentDay = wcms.getRequestParameter("date")?replace("-", "")/>
<#assign contentId = self.contentId />
<#assign url = cm.getLink(self, '/service/broadcast') />
<#assign epgChannel = cm.getLink(self, 'epg.channel') />
<#assign componentId = wcms.generateId("epg-full") />
<#assign typePath = wcms.getCoreAssetUrl("images/icons/fullepg/") />
<#assign timezone = wcms.getContextSetting(self, 'epg.region.timezone') />
<#if timezone?has_content>
  <#setting time_zone="${wcms.translateText(timezone.description)}"/>
</#if>

<@pbe.contextinfo resource=self.contentId?c>
	<@wcms.componentDecorator name="epgFull" options={'id': componentId}>
    <div class="epg-header">
        <div class="title">
            <h2 class="epg-title">${self.title}</h2>
            <p class="epg-subtitle">${wcms.gettext('epg.full.description','What\'s on the ABC and all free to air channels')}</p>
        </div>
    </div>
    <div class="date-selector-cont">
        <div class="date-selector clearfix">
            <ul class="date-selector-list clearfix">
                <li class="day-selector previous"><i class="icon-chevron-left"></i> Previous Day</li>
                <li class="week-selector previous"><i class="icon-chevron-left"></i> Previous Week</li>
                <li class="day">
                    <span class="dayOfWeek">Mon</span>
                    <span class="date"></span>
                </li>
                <li class="day">
                    <span class="dayOfWeek">Tue</span>
                    <span class="date"></span>
                </li>
                <li class="day">
                    <span class="dayOfWeek">Wed</span>
                    <span class="date"></span>
                </li>
                <li class="day">
                    <span class="dayOfWeek">Thu</span>
                    <span class="date"></span>
                </li>
                <li class="day">
                    <span class="dayOfWeek">Fri</span>
                    <span class="date"></span>
                </li>
                <li class="day">
                    <span class="dayOfWeek">Sat</span>
                    <span class="date"></span>
                </li>
                <li class="day">
                    <span class="dayOfWeek">Sun</span>
                    <span class="date"></span>
                </li>
                <li class="week-selector next">Next Week <i class="icon-chevron-right"></i></li>
                <li class="day-selector next">Next Day <i class="icon-chevron-right"></i></li>
            </ul>
            <div class="epg-period-menu">
                <ul class="periods clearfix">
                    <li>${wcms.gettext('epg.time.selector','Jump to')}:</li>
                    <li><a href="#" class="period onnowbt" period="onnow" >On Now</a></li>
                    <li><a href="#" class="period" period="early" >Early</a></li>
                    <li><a href="#" class="period" period="morning" >Morning</a></li>
                    <li><a href="#" class="period" period="afternoon" >Afternoon</a></li>
                    <li><a href="#" class="period" period="evening" >Evening</a></li>
                </ul>
            </div>
        </div>
    </div>

    <div class="epg-grid">
        <div class="scrollbar1">
            <div class="timelineMenu">
                <div class="scrollbar">
                    <div class="track">
                        <div class="rail"></div>
                        <div class="thumb">
                            <div class="end"></div>
                        </div>
                    </div>
                </div>
                <div class="timelineBar">
                    <div class="arrowsRow">
                        <div class="previousHour"><a class="icon-chevron-left previousHigh" title="Previous Hour"></a></div>
                        <div class="nextHour"><a class="icon-chevron-right nextHigh" title="Next Hour"></a></div>
                    </div>
                    <div class="timeline overview">
                        <div class="indicator">ON NOW</div>
                        <span class="period-early">12am</span>
                        <span>12:30am</span>
                        <span>1am</span>
                        <span>1:30am</span>
                        <span>2am</span>
                        <span>2:30am</span>
                        <span>3am</span>
                        <span>3:30am</span>
                        <span>4am</span>
                        <span>4:30am</span>
                        <span>5am</span>
                        <span class="period-morning">5:30am</span>
                        <span>6am</span>
                        <span>6:30am</span>
                        <span>7am</span>
                        <span>7:30am</span>
                        <span>8am</span>
                        <span>8:30am</span>
                        <span>9am</span>
                        <span>9:30am</span>
                        <span>10am</span>
                        <span>10:30am</span>
                        <span>11am</span>
                        <span>11:30am</span>
                        <span class="period-afternoon">12pm</span>
                        <span>12:30pm</span>
                        <span>1pm</span>
                        <span>1:30pm</span>
                        <span>2pm</span>
                        <span>2:30pm</span>
                        <span>3pm</span>
                        <span>3:30pm</span>
                        <span>4pm</span>
                        <span>4:30pm</span>
                        <span>5pm</span>
                        <span>5:30pm</span>
                        <span>6pm</span>
                        <span class="period-evening">6:30pm</span>
                        <span>7pm</span>
                        <span>7:30pm</span>
                        <span>8pm</span>
                        <span>8:30pm</span>
                        <span>9pm</span>
                        <span>9:30pm</span>
                        <span>10pm</span>
                        <span>10:30pm</span>
                        <span>11pm</span>
                        <span>11:30pm</span>
                        <span>12am</span>
                    </div>
                </div>
            </div>
        </div>

        <#if epgServices?size?? && (epgServices?size > 0)>
            <div class="viewport">
                <div class="channel-icon-container">
                    <#list epgServices as item>
                        <div class="channel-icon ${item.contentId}" style="background: #017db3 url(${typePath}${item.name?split("_")[0]}.png) 0 0 no-repeat;">
                            <#if item.navigation?has_content>
                                <#assign serviceUrl = cm.getLink(item.navigation) />
                                <a href="${serviceUrl}" target="_top" class="service-link"></a>
                            </#if>
                        </div>
                    </#list>
                </div>

                <div class="station-heading">${wcms.gettext('epg.full.stationheading','Stations')}</div>

                <div class="overview grid-programs">
                    <div class="indicator-bar"></div>
                    <div class="station-heading-container"></div>

                    <#list epgServices as item>
                        <div class="program-row">
                            <#assign serviceId = item.contentId?string />
                            <#if epgBroadcastEvents?size?? && (epgBroadcastEvents?size > 0)>
                                <#if epgBroadcastEvents[serviceId]??>
                                    <#list epgBroadcastEvents[serviceId] as epgEvent>
                                        <#if !epgDateCurrentDay?has_content>
                                            <#assign aDateTime = .now>
                                            <#assign epgDateCurrentDay = aDateTime?string('yyyyMMdd')>
                                        </#if>
                                        <#assign startDate = epgEvent.startTime?string('yyyyMMdd') />
                                        <#assign endDate = epgEvent.endTime?string('yyyyMMdd') />
                                        <#assign todayNumber = epgDateCurrentDay?number />
                                        <#assign startDateNumber = startDate?number />
                                        <#assign endDateNumber = endDate?number />

                                        <#if (todayNumber < endDateNumber)>
                                            <#assign startDateFinal = epgEvent.startTime?string('HHmm') />
                                            <#assign endDateNumberFinal = '2359' />
                                        <#elseif (endDateNumber > startDateNumber)>
                                            <#assign startDateFinal = '0000' />
                                            <#assign endDateNumberFinal = epgEvent.endTime?string('HHmm') />
                                        <#else>
                                            <#assign startDateFinal = epgEvent.startTime?string('HHmm') />
                                            <#assign endDateNumberFinal = epgEvent.endTime?string('HHmm') />
                                        </#if>

                                        <span class="program-slot ${serviceId}-${epgEvent_index}" timestart="${startDateFinal}" timeend="${endDateNumberFinal}" programid="${serviceId}-${epgEvent_index}">
                                            <div class="title">${epgEvent.title}</div>
                                            <div class="time">${epgEvent.startTime?string('hh:mm a')} - ${epgEvent.endTime?string('hh:mm a')}</div>
                                            <div class="time mobile">${epgEvent.startTime?string('hh:mm a')}</div>
                                            <div class="on-now">ON NOW</div>
                                        </span>

                                        <#assign smallSlotResult = endDateNumberFinal?number-startDateFinal?number />
                                        <#if (smallSlotResult < 7)>
                                            <div class="tooltip ${serviceId}-${epgEvent_index}">
                                                <div>${epgEvent.title}</div>
                                                <div>${epgEvent.startTime?string('hh:mm a')} - ${epgEvent.endTime?string('hh:mm a')}, ${item.description}</div>
                                            </div>
                                        </#if>

                                    </#list>
                                </#if>
                            </#if>
                        </div>
                        <#if epgBroadcastEvents?size?? && (epgBroadcastEvents?size > 0)>
                            <#if epgBroadcastEvents[serviceId]??>
                                <#list epgBroadcastEvents[serviceId] as epgEvent>
                                    <div class="program-details ${serviceId}-${epgEvent_index}">

                                        <span class="close-bt" >
                                            <div class="close-icon"><i class="icon-times"></i></div>
                                            <div class="close-txt">Close</div>
                                        </span>

                                        <#if epgEvent.thumbnailId?has_content && epgThumbnails[epgEvent.thumbnailId]??>
                                            <div class="photo">
                                                <@wcms.helpers.image ratio=ratio imageSize="thumbnail" image=epgThumbnails[epgEvent.thumbnailId] />
                                            </div>
                                        </#if>

                                        <div class="info">
                                            <h4>${epgEvent.title}</h4>
                                            <p>${epgEvent.startTime?string('EEEE, d MMM')}</p>

                                            <#if (epgEvent.episodeNumber?has_content && epgEvent.episodeNumber > 0) || (epgEvent.seriesNumber?has_content && epgEvent.seriesNumber > 0)>
                                                <p>
                                                <#if epgEvent.seriesNumber?has_content && (epgEvent.seriesNumber > 0)>
                                                    Series ${epgEvent.seriesNumber} |
                                                </#if>

                                                <#if epgEvent.episodeNumber?has_content && (epgEvent.episodeNumber > 0)>
                                                    Episode ${epgEvent.episodeNumber}
                                                </#if>
                                                </p>
                                            </#if>

                                            <p>${epgEvent.startTime?string('hh:mm a')} - ${epgEvent.endTime?string('hh:mm a')} [<#if epgEvent.duration?has_content><#assign durationMins = (epgEvent.duration / 1000/ 60)?floor/>${durationMins}</#if> mins]</p>
                                            <div class="icons-container">
                                                <#if epgClassifType[epgEvent.id]??><div class="classif-type"><#assign typePath = "images/classification/" + epgClassifType[epgEvent.id]?lower_case + "Epg.png" /><img src="${wcms.getCoreAssetUrl(typePath)}" alt="Video classified as ${epgClassifType[epgEvent.id]}"></div></#if>
                                                <#if epgEvent.closedCaption><div class="closed-caption">CC</div></#if>
                                                <#if epgEvent.repeat><div class="closed-caption">Repeat</div></#if>
                                            </div>
                                            <div class="description-container">
                                                <div class="description">
                                                    <#if epgEvent.description?has_content>
                                                        <p>${epgEvent.description}</p>
                                                    </#if>
                                                </div>
                                                <div class="links">
                                                    <#if epgEvent.programId?has_content && epgPrograms[epgEvent.programId]??>
                                                        <p class="moreLink">
                                                            <a href="<@cm.link target=epgPrograms[epgEvent.programId]! params={'absolute':true}/>">${wcms.gettext('epg.program.more','More about this show')}<i class="icon-chevron-right"></i></a>
                                                        </p>
                                                    </#if>

                                                    <#if item.navigation?has_content>
														<#if self.linktext?has_content>
															<#assign linktext = self.linktext />
														<#elseif item.navigation?has_content>
															<#assign linktext = item.description + " Schedule" />
														<#else>
															<#assign linktext = "ABC Schedule" />
														</#if>
                                                        <p class="moreLink">
                                                            <a href="<@cm.link target=item.navigation! params={'absolute':true}/>">${linktext}<i class="icon-chevron-right"></i></a>
                                                        </p>
                                                    </#if>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </#list>
                            </#if>
                        </#if>
                    </#list>

                </div>
            </div>
        <#else>
            <div class="viewport">No Events Returned</div>
        </#if>
    </div>

	</@wcms.componentDecorator>
</@pbe.contextinfo>
<@wcms.plugins.registerJsPlugin plugin='epgfull' selector=componentId />