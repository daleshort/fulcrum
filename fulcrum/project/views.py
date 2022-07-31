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

# Create your views here.


class ResultsViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = ResultsSerializer

    def get_queryset(self):
        queryset = Results.objects.all()
        if 'measure' in self.request.query_params:
            measure = self.request.query_params['measure']
            queryset = queryset.filter(measure=measure)
        if 'start_date' in self.request.query_params:
            start_date = self.request.query_params['start_date']
            queryset = queryset.filter(date__gt=start_date)
        if 'end_date' in self.request.query_params:
            end_date = self.request.query_params['end_date']
            queryset = queryset.filter(date__lt=end_date)
        if 'nulldate' in self.request.query_params:
            pass
        else:
            queryset = queryset.exclude(date__isnull=True)
        return queryset.order_by('date')


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
