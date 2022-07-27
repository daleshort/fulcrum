from array import array
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Measure, Results
from pprint import pprint
from datetime import datetime
from dateutil.relativedelta import relativedelta
import re


date_format = '%Y-%m-%d'


def processFixed(measure):
    # clear out the measures
    Results.objects.filter(measure=measure.id).delete()
    #write in new
    parameter_float = measure.parameters.get(
        parameter_title="Value").parameter_float
    Results.objects.create(project=measure.project,
                           measure=measure, measure_result=parameter_float)
# need to also call this when a measure is made but after the parameters are generated
# send an empty put request to the measure after is it created?


def processRepeated(measure):
    # clear out the measures
    Results.objects.filter(measure=measure.id).delete()
    #write in new
    # 2022-08-06
    parameter_start_date = measure.parameters.get(
        parameter_title="Start Date").parameter_date
    # parameter_start_date = datetime.strptime(
    #     parameter_start_date_str, date_format)

    parameter_end_date = measure.parameters.get(
        parameter_title="End Date").parameter_date
    # parameter_end_date = datetime.strptime(
    #     parameter_end_date_str, date_format)

    repeat_frequency = measure.parameters.get(
        parameter_title="Repeat Frequency").parameter_char
    parameter_float = measure.parameters.get(
        parameter_title="Value").parameter_float

    if repeat_frequency == "daily":
        delta = relativedelta(days=1)
    if repeat_frequency == "weekly":
        delta = relativedelta(weeks=1)
    if repeat_frequency == "monthly":
        delta = relativedelta(months=1)

    date = parameter_start_date
    while(date < parameter_end_date):
        Results.objects.create(project=measure.project,
                               measure=measure, measure_result=parameter_float, date=date)
        date = date + delta

    # run while loop to generate measures


def processFixedValueAtDate(measure):
    # clear out the measures
    Results.objects.filter(measure=measure.id).delete()
    #write in new
    parameter_float = measure.parameters.get(
        parameter_title="Value").parameter_float
    parameter_date = measure.parameters.get(
        parameter_title="Date").parameter_date
    Results.objects.create(project=measure.project,
                           measure=measure, measure_result=parameter_float, date=parameter_date)


def processRelatedExpression(measure):
    Results.objects.filter(measure=measure.id).delete()
    parameter_expression = measure.parameters.get(
        parameter_title="Expression").parameter_char

    list_of_measure_ids = parseMeasuresFromExpression(
        parameter_expression)
    print(list_of_measure_ids)

    list_of_dates = []
    for id in list_of_measure_ids:

        values_list_of_dict = Results.objects.filter(
            measure=id).values("date")
        values_unpacked_list = [x['date'] for x in values_list_of_dict]
        list_of_dates = list_of_dates + values_unpacked_list
    # Make list of dates only unique
    list_of_dates = (list(set(list_of_dates)))

    print(list_of_dates)

    my_regex = '\{p[0-9]+m[0-9]+\}'
    for d in list_of_dates:
        working_parameter_expression = str(parameter_expression)
        matches = re.finditer(my_regex, working_parameter_expression)

        for m in matches:
            child_measure_id = re.search(
                'm[0-9]+', m[0])[0].replace('m', '')
            measure_value = getMeasureResultForDateOrAssume(
                child_measure_id, d)
            print("measure value:", measure_value)
            working_parameter_expression = working_parameter_expression.replace(
                m[0], str(measure_value))
        print(working_parameter_expression)
        expression_result = eval(working_parameter_expression)
        Results.objects.create(project=measure.project,
                               measure=measure, measure_result=expression_result, date=d)


def getMeasureResultForDateOrAssume(measure_id: int, date: datetime) -> float:
    # for each measure in expression get the the measure at that date.
    #   If it doesn't exist get the value at null date. If that doesn't exist assume 0.
    measure_query = Results.objects.filter(
        measure=measure_id).filter(date=date)
    if(measure_query.count()):
        measure_value = measure_query.get().measure_result
    else:
        default_null_value_available_query = Results.objects.filter(
            measure=measure_id).filter(date=None)
        if default_null_value_available_query.count():
            measure_value = default_null_value_available_query.get().measure_result
        else:
            measure_value = 0
    return measure_value


def parseMeasuresFromExpression(expression: str) -> list[int]:
    my_regex = '\{p[0-9]+m[0-9]+\}'
    matches = re.finditer(my_regex, expression)
    list_of_measure_ids = []
    for m in matches:
        measure_id = re.search('m[0-9]+', m[0])[0].replace('m', '')
        list_of_measure_ids.append(int(measure_id))
    return list_of_measure_ids


@receiver(post_save, sender=Measure)
def create_results_for_measures(sender, **kwargs):
    print("new measure created")
    measure = kwargs['instance']
    parameters = measure.parameters.all()

    # check if there are parameters.  If there are no parameters,
    # it's a new measure being created which doesnt have parameters yet
    if parameters:
        # debug printing
        for parameter in parameters:
            print("parameter:", parameter)
            print("parameter_float", parameter.parameter_float)
            print("parameter_date", parameter.parameter_date)
            print("parameter_char", parameter.parameter_char)
            print("parameter_title", parameter.parameter_title)

        measure_update_router(measure)

def measure_update_router(measure):
        if measure.type == "fixed_value":
            processFixed(measure)
        elif measure.type == "fixed_value_at_date":
            processFixedValueAtDate(measure)
        elif measure.type == "repeated":
            processRepeated(measure)
        elif measure.type == "related_expression":
            processRelatedExpression(measure)