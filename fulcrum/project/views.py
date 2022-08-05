#from django.shortcuts import render
# # Create your views here.
# from itertools import product
# from multiprocessing import context
# from urllib import request


from itertools import product
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from .models import Project, ProjectTag
from .serializers import *
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response

from datetime import datetime
from dateutil.relativedelta import relativedelta

from django.db.models import Sum

# Create your views here.



class ConsolidateResults(APIView):

    def get(self, request):
        queryset = Results.objects.all()
        if 'measure' in self.request.query_params:
            measure = self.request.query_params['measure']
            queryset = queryset.filter(measure=measure)
        if 'start_date' in self.request.query_params:
            start_date = self.request.query_params['start_date']
            queryset = queryset.filter(date__gte=start_date)
        if 'end_date' in self.request.query_params:
            end_date = self.request.query_params['end_date']
            queryset = queryset.filter(date__lte=end_date)
        if 'nulldate' in self.request.query_params:
            pass
        else:
            queryset = queryset.exclude(date__isnull=True)
        queryset = queryset.order_by('date')

        if 'collect' in self.request.query_params:
            collect = self.request.query_params['collect']
           # print("collect", collect)

        results_list = []
        # get the minimum date and get the max date
        response_data = queryset.values()
      #  print("response_data", response_data)
        min_date = response_data[0]['date']
        if isinstance(min_date,type(None)):
            min_date = response_data[1]['date']

        base_data = response_data[0]

        max_date = response_data[response_data.count()-1]['date']
        print("min date", min_date, "max date", max_date)
        # find the last day of the month in the minimum date

        def last_day_of_month(any_day):
            # The day 28 exists in every month. 4 days later, it's always next month
            next_month = any_day.replace(day=28) + relativedelta(days=4)
            # subtracting the number of the current day brings us back one month
            return next_month - relativedelta(days=next_month.day)

        last_day = last_day_of_month(min_date)
        first_day = min_date
        print('last day', last_day)

        # consolidate results from the minimum date to the last day of the month
        copy_queryset = queryset
        result = copy_queryset.filter(date__gte=first_day).filter(
            date__lte=last_day).aggregate(Sum('measure_result'))['measure_result__sum']
        #print("result", result)
        # make a result for the last day of the month with the sum
        base_data['measure_result'] = result
        base_data['date'] = last_day
        results_list.append(base_data.copy())
       # print('results list', results_list)

        while last_day <= max_date:
            # if the last day of the month isn't greater than the max date
            # increment the month
            print('last day', last_day)
            first_day = last_day+ relativedelta(days=1)
            last_day = last_day_of_month(first_day)
            copy_queryset = queryset
            result = copy_queryset.filter(date__gte=first_day).filter(
                date__lte=last_day).aggregate(Sum('measure_result'))['measure_result__sum']
           # print("result", result)
            # make a result for the last day of the month with the sum
            base_data['measure_result'] = result
            base_data['date'] = last_day
            results_list.append(base_data.copy())
           # print('results list', results_list)


        return Response(results_list)
        #return Response(queryset.values())


class ResultsViewSet(viewsets.ReadOnlyModelViewSet):

    def get_serializer_class(self, *args, **kwargs):
        if 'collect' in self.request.query_params:
            pass
        else:
            return ResultsSerializer

    def get_queryset(self):
        queryset = Results.objects.all()
        if 'measure' in self.request.query_params:
            measure = self.request.query_params['measure']
            queryset = queryset.filter(measure=measure)
        if 'start_date' in self.request.query_params:
            start_date = self.request.query_params['start_date']
            queryset = queryset.filter(date__gte=start_date)
        if 'end_date' in self.request.query_params:
            end_date = self.request.query_params['end_date']
            queryset = queryset.filter(date__lte=end_date)
        if 'nulldate' in self.request.query_params:
            pass
        else:
            queryset = queryset.exclude(date__isnull=True)
        return queryset.order_by('date')

    def get_serializer_context(self):
        return {"request_data": self.request.data, "query_params": self.request.query_params}


class MeasureViewSet(ModelViewSet):
    serializer_class = MeasureSerializer

    def get_queryset(self):
        return Measure.objects.filter(project=self.kwargs['project_pk'])

    def get_serializer_context(self):
        return {'project_id': self.kwargs['project_pk'], "request_data": self.request.data}
# # list of all projects


class VisualViewSet(ModelViewSet):
    serializer_class = VisualSerializer

    def get_queryset(self):
        return Visual.objects.all()

    def get_serializer_context(self):
        return {"request_data": self.request.data}


class MeasureListViewSet(ModelViewSet):
    serializer_class = MeasureSerializer

    def get_queryset(self):
        queryset = Measure.objects.all()
        project_id = self.request.query_params.get('project_id')
        if project_id is not None:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def create(self, request, *args, **kwargs):
        project_id = request.data['project_id']
        _serializer = self.serializer_class(
            data=request.data, context={'project_id': project_id})
        if _serializer.is_valid():
            _serializer.save()
            return Response(data=_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(data=_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ParameterViewSet(ModelViewSet):
    serializer_class = ParameterSerializer
    queryset = Parameter.objects.all()

    def get_serializer_context(self):
        return {'measure_id': self.kwargs['measure_pk']}


# list of all projects


class ProjectViewSet(ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

# list of all tags in all projects


class ProjectTagListViewSet(ModelViewSet):
    serializer_class = ProjectTagListSerializer
    queryset = ProjectTag.objects.all()

    def create(self, request, *args, **kwargs):
        project_id = request.data['project_id']
        _serializer = self.serializer_class(
            data=request.data, context={'project_id': project_id})
        if _serializer.is_valid():
            _serializer.save()
            return Response(data=_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(data=_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# tags for a specific project


class ProjectTagViewSet(ModelViewSet):
    serializer_class = ProjectTagSerializer

    def get_queryset(self):
        return ProjectTag.objects.filter(project_id=self.kwargs['project_pk'])

    def get_serializer_context(self):
        return {'project_id': self.kwargs['project_pk']}
