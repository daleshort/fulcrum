# Fulcrum Forecast

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"gradient":"vivid-cyan-blue-to-vivid-purple","width":75,"align":"center","style":{"border":{"radius":"0px"}}} -->
<div class="wp-block-button aligncenter has-custom-width wp-block-button__width-75"><a class="wp-block-button__link has-vivid-cyan-blue-to-vivid-purple-gradient-background has-background" href="https://programmerd.com/fulcrum/" style="border-radius:0px" target="_blank" rel="noreferrer noopener"><strong>Live Demo</strong></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

Fulcrum Forecast is a numeric project forecasting tool. It replaces spreadsheets of interconnected formulas by automatically calculating forecasted data and generating visualizations based off of measurements defined for a project.  A web GUI built in React allows a user to quickly build a project model and view charts and graphs of the resulting data.  A SQL relational database accessed using Django is used to store configuration and forecast data. 


<!-- wp:heading -->
<h2>Motivation</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>My wife, Justine, uses a series of interconnected spreadsheets to model the sales forecast of book publishing projects she's managing.  The spreadsheets consider things like sales projections, revenue splits, printing costs, and projected returns to try and come up with a month-by-month view of the business's cash flow. The spreadsheets are fairly clever in their implementation, but still have limitations like having to manually re-link fields if a publishing date is changed.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Approach</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I reviewed the spreadsheets and determined the core building blocks are Measurements and Visuals.  </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Measurements are quantities that describe the project. I noticed a few kinds of measurements:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li>Fixed Values: <em> 50/50% revenue split </em>(just making these numbers up!)</li><li>Fixed Values at Dates: <em>Marketing $10,000 on July 1</em></li><li>Reoccurring Fixed Values: <em>$1000 Software Fees monthly from July 1 to September 1</em></li><li>Distributed Values: <em>10,000 Books sold between September 1 and December 1 with strong initial sales followed by a cooldown</em></li><li>Related Values: <em>Printing cost is $5 times the number of books sold</em></li><li>Related Values offset in time: <em>Book returns are 10% of books sold with a 1 month lag</em></li></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Visuals are just the results of measurements and optionally may include some aggregation</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li>Graphs</li><li>Charts</li><li>Charts of data totaled by month</li><li>Pie Charts</li></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>I gathered my thoughts and observations into this <a href="https://miro.com/app/board/uXjVOlCbSYo=/?share_link_id=900069691902" data-type="URL" data-id="https://miro.com/app/board/uXjVOlCbSYo=/?share_link_id=900069691902">Miro Board</a> prior to starting development including some thoughts about GUI wireframes and SQL models. I think it's always interesting to ideas evolve and looking back at this presentation, I only kept about 50% of the original ideas.</p>
<!-- /wp:paragraph -->


<!-- wp:heading -->
<h2>A Guided Tour</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Let's pretend we're the owners of The Cat Ranch and we want to forecast our profit for the next three months.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Create Measurements</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>First we need to make a project for The Cat Ranch.  Projects are just groups of measurements.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"align":"center","id":322,"sizeSlug":"large","linkDestination":"media"} -->
<figure class="wp-block-image aligncenter size-large"><a href="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-10.50.48-AM.png"><img src="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-10.50.48-AM-500x174.png" alt="" class="wp-image-322"/></a></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>Then let's add a measurement that represents our daily cat population of 100 cats.  By using the repeated measurement type we can set our project to have a measurement of 100 cats every day between 8/8/2022 and 1/1/2023.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"align":"center","id":324,"sizeSlug":"large","linkDestination":"media"} -->
<figure class="wp-block-image aligncenter size-large"><a href="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-10.52.16-AM.png"><img src="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-10.52.16-AM-500x420.png" alt="" class="wp-image-324"/></a></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>We can also add a fixed value measurement of the daily cost to feed our cats.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"align":"center","id":327,"sizeSlug":"large","linkDestination":"media"} -->
<figure class="wp-block-image aligncenter size-large"><a href="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-10.53.29-AM.png"><img src="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-10.53.29-AM-500x344.png" alt="" class="wp-image-327"/></a></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>Let's pretend The Cat Ranch has anywhere between 15 and 100 visitors a day.  Our peak busy season is September and we get close to 100 visitors a day (those fall colors really make the cats pop).  To represent this we'll create a scaled measurement.  The distribution tool allows us to draw a scaling profile of the measurement.  This will cause the database to scale the value between 0-100% of the value according to the profile we draw.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"align":"center","id":328,"sizeSlug":"large","linkDestination":"media"} -->
<figure class="wp-block-image aligncenter size-large"><a href="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-10.55.03-AM.png"><img src="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-10.55.03-AM-500x344.png" alt="" class="wp-image-328"/></a></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>Ok now here's where it really starts to get good.  To create a measurement of our cost we'll make a measurement using the related measurement type.  A related measurement is a measurement where the value is the result of a computed expression that can depend on other measurements in the database.  So we'll create a related measurement and use the picker to select the number of cats at The Cat Ranch and multiply it by the cost of feeding each cat.  The expression is a special syntax string the database understands and multiplication, division, addition, subtraction, and parenthesis are supported.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"align":"center","id":329,"sizeSlug":"large","linkDestination":"media"} -->
<figure class="wp-block-image aligncenter size-large"><a href="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-10.56.33-AM.png"><img src="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-10.56.33-AM-500x256.png" alt="" class="wp-image-329"/></a></figure>
<!-- /wp:image -->

<!-- wp:image {"align":"center","id":330,"sizeSlug":"large","linkDestination":"media"} -->
<figure class="wp-block-image aligncenter size-large"><a href="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-10.57.58-AM.png"><img src="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-10.57.58-AM-500x247.png" alt="" class="wp-image-330"/></a></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>The related parameters can also include lag- for example let us say 25% of all visitors sign up for a membership after we email them a link 30 days after their visit.  We'll add a lag by 30 days selection to the daily visitors measurement and multiply it by .25.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"align":"center","id":331,"width":501,"height":445,"sizeSlug":"large","linkDestination":"media"} -->
<figure class="wp-block-image aligncenter size-large is-resized"><a href="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.00.28-AM.png"><img src="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.00.28-AM-500x444.png" alt="" class="wp-image-331" width="501" height="445"/></a></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>I won't show it here but using these concepts I created a ticket cost of $5 and a revenue measurement by multiplying the ticket cost by the number of visitors.  I then created a profit measurement which is revenue minus the cost measurement.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Visualizations</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Now that we defined measurements (and the database behind the scenes has been calculating results as we entered measurements) we can create visualizations to view the state of the project.  First a visualization has to be intialized:</p>
<!-- /wp:paragraph -->

<!-- wp:image {"align":"center","id":332,"sizeSlug":"large","linkDestination":"media"} -->
<figure class="wp-block-image aligncenter size-large"><a href="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.03.06-AM.png"><img src="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.03.06-AM-500x192.png" alt="" class="wp-image-332"/></a></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>Once we have a visualization started we can add what measurements we want to display.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"align":"center","id":333,"sizeSlug":"large","linkDestination":"media"} -->
<figure class="wp-block-image aligncenter size-large"><a href="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.04.10-AM.png"><img src="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.04.10-AM-500x302.png" alt="" class="wp-image-333"/></a></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>Here is a chart of our three populations: cats, visitors and members.  The optional date range picker in each measurement allows us to only view data for a set date range, but this case, we're just viewing all data available.  There are some basic statistics about each dataset below the plot and a button to export the data to excel format.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"align":"center","id":335,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image aligncenter size-large"><img src="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.05.36-AM-500x455.png" alt="" class="wp-image-335"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>Visualizations can also aggregate data.  For example, by setting the "monthly" option in each dataset and switching to a bar chart, we can go from plot of daily profit to a monthly summary of profit.</p>
<!-- /wp:paragraph -->

<!-- wp:jetpack/tiled-gallery {"columnWidths":[["27.73855","47.49382","24.76763"]],"ids":[343,341,342],"linkTo":"media"} -->
<div class="wp-block-jetpack-tiled-gallery aligncenter is-style-rectangular"><div class="tiled-gallery__gallery"><div class="tiled-gallery__row"><div class="tiled-gallery__col" style="flex-basis:27.73855%"><figure class="tiled-gallery__item"><a href="https://i0.wp.com/mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.07.23-AM-3-500x326.png?ssl=1"><img alt="" data-height="625" data-id="343" data-link="https://mechied.com/?attachment_id=343#main" data-url="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.07.23-AM-3-500x326.png" data-width="960" src="https://i0.wp.com/mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.07.23-AM-3-500x326.png?ssl=1" data-amp-layout="responsive"/></a></figure></div><div class="tiled-gallery__col" style="flex-basis:47.49382%"><figure class="tiled-gallery__item"><a href="https://i1.wp.com/mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.08.02-AM-2-500x190.png?ssl=1"><img alt="" data-height="364" data-id="341" data-link="https://mechied.com/?attachment_id=341#main" data-url="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.08.02-AM-2-500x190.png" data-width="960" src="https://i1.wp.com/mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.08.02-AM-2-500x190.png?ssl=1" data-amp-layout="responsive"/></a></figure></div><div class="tiled-gallery__col" style="flex-basis:24.76763%"><figure class="tiled-gallery__item"><a href="https://i0.wp.com/mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.08.59-AM-500x365.png?ssl=1"><img alt="" data-height="621" data-id="342" data-link="https://mechied.com/?attachment_id=342#main" data-url="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.08.59-AM-500x365.png" data-width="851" src="https://i0.wp.com/mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.08.59-AM-500x365.png?ssl=1" data-amp-layout="responsive"/></a></figure></div></div></div></div>
<!-- /wp:jetpack/tiled-gallery -->

<!-- wp:paragraph -->
<p>Pie chart visualizations are also provided.  Pie charts compare the sum or average of the measurements selected.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"align":"center","id":346,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image aligncenter size-large"><img src="https://mechied.com/wp-content/uploads/2022/08/Screen-Shot-2022-08-08-at-11.10.12-AM-478x500.png" alt="" class="wp-image-346"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":3} -->
<h3>More Cat food-for-thought</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Hopefully you understand the basic workflow at this point.  Not only can we create measurements and measurements that depend on measurements, those measurements can depend on other dependent measurements! Measurements can have a sense of time, or just be fixed quantities.  Visualizations can display time in a 1-to-1 manner, or they can summarize across time.  And since everything is linked, updates to the measurements are automatically updated and reflected in the visualizations!</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Backend Architecture</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I'm interested in improving my skills with Python and Javascript so I constructed programs using a Python backend using the Django and Django Rest Framework and Javascript using React.  </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The user creates and views measurements in one interface and visualizes the results in a second interface. The second interface stores the state of the users visualizations so that they can easily be recalled.  A REST API is used to communicate with the database. When the user creates new measurements, a Django Signal is triggered that causes the results table to be updated.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"align":"center","id":309,"sizeSlug":"full","linkDestination":"none"} -->
<figure class="wp-block-image aligncenter size-full"><img src="https://mechied.com/wp-content/uploads/2022/08/Fulcrum-Concept-Update-8_3_2022-1.jpg" alt="" class="wp-image-309"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":3} -->
<h3>Handling of Related Measurements</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Creating a view of database state in React is not particularly novel. However allowing a user to create measurements that depend on other measurements required more cleverness and this section describes a little bit about how they are handled. </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The first step was defining how the frontend would communicate these measurements. This could have been a dedicated SQL database structure but to simplify implementation I decided to use a string syntax to define related measurements. Here is an example of the syntax:</p>
<!-- /wp:paragraph -->

<!-- wp:quote -->
<blockquote class="wp-block-quote"><p>{p33m97l+20}[Test Project:Book Cost]*.25+{p33m104l+20}[Other Project:Marketing Cost]</p></blockquote>
<!-- /wp:quote -->

<!-- wp:paragraph -->
<p>The curly braces are what's parsed by the database but the square brackets contain more human-friendly text descriptions of what project and measurement are being specified. Inside the curly braces there is a project tag, measurement tag, and time offset code. The project and measurement tags are actually the keys to the project and measurement in the database. The time offset code allows the result to "lag" or "lead" the measurement. Now since writing this by hand would be a pretty big ask of the users, they can actually select these values in a modal and insert them into the measurement. Users can specify addition, subtraction, multiplication, division, exponents, and parentheses (but more to come on this later).</p>
<!-- /wp:paragraph -->

<!-- wp:image {"align":"center","id":311,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image aligncenter size-large"><img src="https://mechied.com/wp-content/uploads/2022/08/image-500x335.png" alt="" class="wp-image-311"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>When a user saves a new measurement with this syntax a HTTP POST request is generated to the database. Django first creates a measurement configuration record:</p>
<!-- /wp:paragraph -->

```python #views.py

class MeasureViewSet(ModelViewSet):
    serializer_class = MeasureSerializer

    def get_queryset(self):
        return Measure.objects.filter(project=self.kwargs['project_pk'])

    def get_serializer_context(self):
        return {'project_id': self.kwargs['project_pk'], "request_data": self.request.data}```

<!-- wp:paragraph -->
<p>A measurement is described by several parameters which are a nested object inside the HTTP POST request. This requires a custom serializer to unpack and generate/update the nested models.</p>
<!-- /wp:paragraph -->

```python #serializers.py

class MeasureSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        parameter_data = validated_data.pop('parameters')
        project_id = self.context['project_id']

        measure = Measure.objects.create(
            project_id=project_id, **validated_data)

        for parameter in parameter_data:
            Parameter.objects.create(measure=measure, **parameter)
        return measure

    def update(self, instance, validated_data):

        if self.context['request_data'].get('parameters'):
            parameter_data = self.context['request_data'].pop('parameters')
            validated_parameter_data = validated_data.pop('parameters')
            # note that we're using raw data from the request data and not the validated data
            # when we go to update the nested object because we need the ID field which is stripped
            # from validated data

            parameter_dict = dict((i.id, i) for i in instance.parameters.all())

            for item_data in parameter_data:
                if 'id' in item_data:
                    # if exists id remove from the dict and update
                    parameter_item = parameter_dict.pop(item_data['id'])
                    # remove id from validated data as we don't require it.
                    item_data.pop('id')
                    # loop through the rest of keys in validated data to assign it to its respective field
                    for key in item_data.keys():
                        setattr(parameter_item, key, item_data[key])

                    parameter_item.save()
                else:
                    # else create a new object
                    Parameter.objects.create(measure=instance, **item_data)

        # delete remaining elements because they're not present in my update call
            if len(parameter_dict) &gt; 0:
                for item in parameter_dict.values():
                    item.delete()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance

    parameters = ParameterSerializer(many=True, read_only=False)
```

<!-- wp:paragraph -->
<p>After the measurement is created, a signal function is called that uses the measurement's parameters to perform calculations of the results and updates a table of measurement results. This function is fairly hefty so I won't reproduce it here, but I will discuss a few interesting aspects.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The first is what happens to parse the related expression string syntax and calculate the result. A series of regular expressions are used to pull the project, measure, and offset out of the expression string. Then the database queries for those results and puts the actual values into the expression string.  Finally, since I'm avoiding writing my own parser, the python eval() method is used to act as the calculator (at some risk-- I do pass an <a href="https://www.programiz.com/python-programming/methods/built-in/eval" data-type="URL" data-id="https://www.programiz.com/python-programming/methods/built-in/eval">empty globals dictionary</a> but the user could write some stupid stuff into the string that I'm not checking for).</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Another key aspect is updated related expression measurements that depend on measurements that themselves have dependents.  Suppose we have a measurement tree as follows:</p>
<!-- /wp:paragraph -->

<!-- wp:image {"align":"center","id":314,"sizeSlug":"vp_lg","linkDestination":"none"} -->
<figure class="wp-block-image aligncenter size-vp_lg"><img src="https://mechied.com/wp-content/uploads/2022/08/Fulcrum-Concept-Frame-6-edited-500x354.jpg" alt="" class="wp-image-314"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>Clearly the order of update will matter or else related measurements will use old data to generate.  Before I wrote the function that handled this in the database I wrote a small python simulation and used the dependency scenario given in the diagram as test data.  In writing it, I used dictionaries and functions like get_measure_by_id to make it clear where later I'd be using Django queries.  My solution uses a tree data structure and recursion to cause the update to propagate through the tree in the correct order:</p>
<!-- /wp:paragraph -->

```python class measure_list():
    def __init__(self) -&gt; None:                
        self.data = [measure(1, [2, 3, 4]),
            measure(2, [5]),
            measure(3, []),
            measure(4, []),
            measure(5, [3, 6, 7, 8]),
            measure(6, []),
            measure(7, []),
            measure(8, [3])]

    def get_measure_by_id(self, id:int):
        return list(filter(lambda x: x.get_id()==id,self.data))[0]

    def get_dependents_by_id(self,id:int) -&gt; list[int]:
        return list(filter(lambda x: x.get_id()==id,self.data))[0].get_depends_on()

    def tell_id_to_update(self,id:int):
        measure = self.get_measure_by_id(id)
        did_measure_update = measure.update()
        return did_measure_update

class measure ():
    def __init__(self, id: int, depends_on: list[int], ) -&gt; None:
        self.id = id
        self.depends_on = depends_on
        self.is_updated = False

    def set_measure_list(self,measure_list: measure_list) -&gt; None:
        self.measure_list = measure_list

    def get_id(self) -&gt; int:
        return self.id
    def get_depends_on(self) -&gt; list[int]:
        return self.depends_on

    def update(self):
        if self.depends_on == []:
            self.is_updated = True
            print(str(self.get_id()) + "has updated")
            return True
        else:
            results = []
            for child in self.depends_on:
                results.append(self.measure_list.tell_id_to_update(child))
            self.is_updated = True
            print(str(self.get_id()) + "has updated")
            return True

my_measure_list = measure_list()
for measure in my_measure_list.data:
    measure.set_measure_list(my_measure_list)

print(my_measure_list.tell_id_to_update(1))
```

```python Output:
3has updated
6has updated
7has updated
3has updated
8has updated
5has updated
2has updated
3has updated
4has updated
1has updated
True</code></pre>
```

<!-- wp:paragraph -->
<p>If you look at the output the solution one inefficiency in this approach is that the child "leaf" nodes are told to update multiple times.  It's not harmful but it is slightly inefficient.  I could store if the child has been updated and skip the update but in the actual Django implementation I didn't want to have to manage the "child has been updated already on this update" state.  So I've left it for now.  I think it will be workable since the trees are not likely to be overly complex and the database updates are not particularly costly to perform.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Another problem in this implementation is that circular dependency is not handled.  I think that would be easy enough to detect and trigger an error so I plan on fixing it eventually.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The code running on the database looks very similar to this prototype, just with functions like measure_query = Results.objects.filter(measure=measure_id).filter(date=date) used in place of the dictionary functions.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>One final big assumption in the code is that since a measurement could have results with null date, a single date, or several dates, a dependent measurement will first look for a child measurement at the same date, then at null date, then it will just assume 0.</p>
<!-- /wp:paragraph -->
