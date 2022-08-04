from array import array
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Measure, Results
from pprint import pprint
from datetime import datetime
from dateutil.relativedelta import relativedelta
from scipy.interpolate import interp1d
from scipy.integrate import quad
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
    return True

def processDistributed(measure):
    # clear out the measures
    Results.objects.filter(measure=measure.id).delete()
    #write in new
    
    parameter_start_date = measure.parameters.get(
        parameter_title="Start Date").parameter_date


    parameter_end_date= measure.parameters.get(
        parameter_title="End Date").parameter_date

    distribution_str = measure.parameters.get(
        parameter_title="Distribution").parameter_char

    parameter_float = measure.parameters.get(
        parameter_title="Value").parameter_float

    delta = relativedelta(days=1)
    distribution_array = [float(i) for i in distribution_str.split(',')]
    
    print("distribution array", distribution_array)
    print("date span days", (parameter_end_date -parameter_start_date).days)
    date_span_days =(parameter_end_date -parameter_start_date).days
    time_step = date_span_days/(len(distribution_array)-1)
    time_array = []
    for i,val in enumerate(distribution_array):
        time_array.append(i*time_step)
    print("time array", time_array)

    poly_distribution = interp1d(time_array,distribution_array, kind='cubic')
    distribution_area = quad(poly_distribution,time_array[0],time_array[-1],points=time_array)[0]
    print("distribution area", distribution_area)

    date = parameter_start_date
    date_offset = 0
    while date< parameter_end_date:
        date = date + relativedelta(days = 1)
        result = poly_distribution(date_offset) * parameter_float / distribution_area
        Results.objects.create(project=measure.project,
                                measure=measure, measure_result=result, date=date)
        date_offset += 1
    return True

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
    return True



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
    return True


def processRelatedExpression(measure):
    #clear out the old results
    Results.objects.filter(measure=measure.id).delete()

    list_of_measure_ids = get_children_by_measure(measure)
    print("children measures", list_of_measure_ids)

    child_update_results = []
    for child in list_of_measure_ids:
        child_update_results.append(update_measure_by_id(child))
    if all(child_update_results):
        return executeDependentUpdate(measure, list_of_measure_ids)
    else:
        return False


def stripExpressionOfHumanReadable(expression: str) -> str:
    my_regex = '\[[^\]]*\]'
    matches = re.finditer(my_regex, expression)
    for m in matches:
        expression = expression.replace(m[0], '')
    return expression

def getListOfDateOffsets(parameter_expression):
    my_regex = '\{[^}]*\}'
    matches = re.finditer(my_regex, parameter_expression)
    list_of_dates = []
    for m in matches:
        string_expression = m[0]
        
        measure_string = re.search(
            'm[0-9]+', string_expression)[0]
        string_expression=string_expression.replace(measure_string,'')

        project_string = re.search(
            'p[0-9]+', string_expression)[0]
        string_expression=string_expression.replace(project_string,'')
        print('string expression', string_expression)
        if('+' in string_expression):
            offset_type = 'lead'
            offset_amount = re.search(
            'l\+[0-9]+', string_expression)[0].replace('l', '')
            delta = relativedelta(days=float(offset_amount))
        elif('-' in string_expression):
            offset_type = 'lag'
            offset_amount = re.search(
                'l\-[0-9]+', string_expression)[0].replace('l', '')
            delta = relativedelta(days=float(offset_amount))
        else:
            delta = relativedelta(days=0)
        list_of_dates.append(delta)

    return list_of_dates


def executeDependentUpdate(measure, list_of_measure_ids) -> bool:
    # make a list of all dates related to measure
    
    parameter_expression = measure.parameters.get(
        parameter_title="Expression").parameter_char
    parameter_expression = stripExpressionOfHumanReadable(parameter_expression)
    offset_list = getListOfDateOffsets(parameter_expression)

    list_of_dates = []
    for index,id in enumerate(list_of_measure_ids):

        values_list_of_dict = Results.objects.filter(
            measure=id).values("date")
        values_unpacked_list = [x['date']-offset_list[index] for x in values_list_of_dict]
        list_of_dates = list_of_dates + values_unpacked_list
    # Make list of dates only unique
    list_of_dates = (list(set(list_of_dates)))

    print(list_of_dates)


    my_regex = '\{[^}]*\}'
    for d in list_of_dates:
        working_parameter_expression = str(parameter_expression)
        matches = re.finditer(my_regex, working_parameter_expression)

        for m in matches:
            string_expression = m[0]
            child_measure_id = re.search(
                'm[0-9]+', string_expression)[0].replace('m', '')
            
            measure_string = re.search(
                'm[0-9]+', string_expression)[0]
            string_expression=string_expression.replace(measure_string,'')

            project_string = re.search(
                'p[0-9]+', string_expression)[0]
            
            string_expression=string_expression.replace(project_string,'')
            print('string expression', string_expression)
            if('+' in string_expression):
                offset_type = 'lead'
                offset_amount = re.search(
                'l\+[0-9]+', string_expression)[0].replace('l', '')
                delta = relativedelta(days=float(offset_amount))
            elif('-' in string_expression):
                offset_type = 'lag'
                offset_amount = re.search(
                    'l\-[0-9]+', string_expression)[0].replace('l', '')
                delta = relativedelta(days=float(offset_amount))
            else:
                delta = relativedelta(days=0)

            print('offset amount', offset_amount)

            measure_value = getMeasureResultForDateOrAssume(
                child_measure_id, d+delta)
            print("measure value:", measure_value)

            working_parameter_expression = working_parameter_expression.replace(
                m[0], str(measure_value))
        print(working_parameter_expression)
        expression_result = eval(working_parameter_expression, {},{})
        Results.objects.create(project=measure.project,
                               measure=measure, measure_result=expression_result, date=d)
    return True


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
    my_regex = '\{[^}]*\}'
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


def measure_update_router(measure) -> bool:
    if measure.type == "fixed_value":
        result = processFixed(measure)
    elif measure.type == "fixed_value_at_date":
        result = processFixedValueAtDate(measure)
    elif measure.type == "repeated":
        result = processRepeated(measure)
    elif measure.type == "related_expression":
        result = processRelatedExpression(measure)
    elif measure.type == "distributed":
        result = processDistributed(measure)
    return result


def update_measure_by_id(id: int) -> bool:
    measure = Measure.objects.get(id=id)
    result = measure_update_router(measure)
    return result


def get_children_by_id(id: int):
    measure = Measure.objects.get(id=id)
    return get_children_by_measure(measure)


def get_children_by_measure(measure: Measure):
    if measure.type == "related_expression":
        parameter_expression = measure.parameters.get(
            parameter_title="Expression").parameter_char
        parameter_expression = stripExpressionOfHumanReadable(
            parameter_expression)
        return parseMeasuresFromExpression(parameter_expression)
    else:
        return []
