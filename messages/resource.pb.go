// Code generated by protoc-gen-go.
// source: resource.proto
// DO NOT EDIT!

package messages

import proto "github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/golang/protobuf/proto"
import fmt "fmt"
import math "math"

import (
	context "github.com/kildevaeld/projects/Godeps/_workspace/src/golang.org/x/net/context"
	grpc "github.com/kildevaeld/projects/Godeps/_workspace/src/google.golang.org/grpc"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

type ResourceType struct {
	Types []string `protobuf:"bytes,1,rep,name=types" json:"types,omitempty"`
}

func (m *ResourceType) Reset()         { *m = ResourceType{} }
func (m *ResourceType) String() string { return proto.CompactTextString(m) }
func (*ResourceType) ProtoMessage()    {}

type ResourceQuery struct {
	Id        string `protobuf:"bytes,1,opt,name=id" json:"id,omitempty"`
	Type      int32  `protobuf:"varint,2,opt,name=type" json:"type,omitempty"`
	Name      string `protobuf:"bytes,3,opt,name=name" json:"name,omitempty"`
	ProjectId string `protobuf:"bytes,4,opt,name=project_id" json:"project_id,omitempty"`
}

func (m *ResourceQuery) Reset()         { *m = ResourceQuery{} }
func (m *ResourceQuery) String() string { return proto.CompactTextString(m) }
func (*ResourceQuery) ProtoMessage()    {}

type ResourceCreate struct {
	Data      []byte `protobuf:"bytes,1,opt,name=data,proto3" json:"data,omitempty"`
	Type      string `protobuf:"bytes,2,opt,name=type" json:"type,omitempty"`
	ProjectId string `protobuf:"bytes,3,opt,name=project_id" json:"project_id,omitempty"`
	Name      string `protobuf:"bytes,4,opt,name=name" json:"name,omitempty"`
}

func (m *ResourceCreate) Reset()         { *m = ResourceCreate{} }
func (m *ResourceCreate) String() string { return proto.CompactTextString(m) }
func (*ResourceCreate) ProtoMessage()    {}

type Resource struct {
	Id        string `protobuf:"bytes,1,opt,name=id" json:"id,omitempty"`
	Type      string `protobuf:"bytes,2,opt,name=type" json:"type,omitempty"`
	Name      string `protobuf:"bytes,3,opt,name=name" json:"name,omitempty"`
	Fields    []byte `protobuf:"bytes,4,opt,name=fields,proto3" json:"fields,omitempty"`
	ProjectId string `protobuf:"bytes,5,opt,name=project_id" json:"project_id,omitempty"`
}

func (m *Resource) Reset()         { *m = Resource{} }
func (m *Resource) String() string { return proto.CompactTextString(m) }
func (*Resource) ProtoMessage()    {}

func init() {
	proto.RegisterType((*ResourceType)(nil), "messages.ResourceType")
	proto.RegisterType((*ResourceQuery)(nil), "messages.ResourceQuery")
	proto.RegisterType((*ResourceCreate)(nil), "messages.ResourceCreate")
	proto.RegisterType((*Resource)(nil), "messages.Resource")
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConn

// Client API for Resources service

type ResourcesClient interface {
	Get(ctx context.Context, in *ResourceQuery, opts ...grpc.CallOption) (*Resource, error)
	Create(ctx context.Context, in *ResourceCreate, opts ...grpc.CallOption) (*Resource, error)
	List(ctx context.Context, in *ResourceQuery, opts ...grpc.CallOption) (Resources_ListClient, error)
	ListTypes(ctx context.Context, in *ResourceQuery, opts ...grpc.CallOption) (*ResourceType, error)
}

type resourcesClient struct {
	cc *grpc.ClientConn
}

func NewResourcesClient(cc *grpc.ClientConn) ResourcesClient {
	return &resourcesClient{cc}
}

func (c *resourcesClient) Get(ctx context.Context, in *ResourceQuery, opts ...grpc.CallOption) (*Resource, error) {
	out := new(Resource)
	err := grpc.Invoke(ctx, "/messages.Resources/Get", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *resourcesClient) Create(ctx context.Context, in *ResourceCreate, opts ...grpc.CallOption) (*Resource, error) {
	out := new(Resource)
	err := grpc.Invoke(ctx, "/messages.Resources/Create", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *resourcesClient) List(ctx context.Context, in *ResourceQuery, opts ...grpc.CallOption) (Resources_ListClient, error) {
	stream, err := grpc.NewClientStream(ctx, &_Resources_serviceDesc.Streams[0], c.cc, "/messages.Resources/List", opts...)
	if err != nil {
		return nil, err
	}
	x := &resourcesListClient{stream}
	if err := x.ClientStream.SendMsg(in); err != nil {
		return nil, err
	}
	if err := x.ClientStream.CloseSend(); err != nil {
		return nil, err
	}
	return x, nil
}

type Resources_ListClient interface {
	Recv() (*Resource, error)
	grpc.ClientStream
}

type resourcesListClient struct {
	grpc.ClientStream
}

func (x *resourcesListClient) Recv() (*Resource, error) {
	m := new(Resource)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

func (c *resourcesClient) ListTypes(ctx context.Context, in *ResourceQuery, opts ...grpc.CallOption) (*ResourceType, error) {
	out := new(ResourceType)
	err := grpc.Invoke(ctx, "/messages.Resources/ListTypes", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// Server API for Resources service

type ResourcesServer interface {
	Get(context.Context, *ResourceQuery) (*Resource, error)
	Create(context.Context, *ResourceCreate) (*Resource, error)
	List(*ResourceQuery, Resources_ListServer) error
	ListTypes(context.Context, *ResourceQuery) (*ResourceType, error)
}

func RegisterResourcesServer(s *grpc.Server, srv ResourcesServer) {
	s.RegisterService(&_Resources_serviceDesc, srv)
}

func _Resources_Get_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error) (interface{}, error) {
	in := new(ResourceQuery)
	if err := dec(in); err != nil {
		return nil, err
	}
	out, err := srv.(ResourcesServer).Get(ctx, in)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func _Resources_Create_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error) (interface{}, error) {
	in := new(ResourceCreate)
	if err := dec(in); err != nil {
		return nil, err
	}
	out, err := srv.(ResourcesServer).Create(ctx, in)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func _Resources_List_Handler(srv interface{}, stream grpc.ServerStream) error {
	m := new(ResourceQuery)
	if err := stream.RecvMsg(m); err != nil {
		return err
	}
	return srv.(ResourcesServer).List(m, &resourcesListServer{stream})
}

type Resources_ListServer interface {
	Send(*Resource) error
	grpc.ServerStream
}

type resourcesListServer struct {
	grpc.ServerStream
}

func (x *resourcesListServer) Send(m *Resource) error {
	return x.ServerStream.SendMsg(m)
}

func _Resources_ListTypes_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error) (interface{}, error) {
	in := new(ResourceQuery)
	if err := dec(in); err != nil {
		return nil, err
	}
	out, err := srv.(ResourcesServer).ListTypes(ctx, in)
	if err != nil {
		return nil, err
	}
	return out, nil
}

var _Resources_serviceDesc = grpc.ServiceDesc{
	ServiceName: "messages.Resources",
	HandlerType: (*ResourcesServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "Get",
			Handler:    _Resources_Get_Handler,
		},
		{
			MethodName: "Create",
			Handler:    _Resources_Create_Handler,
		},
		{
			MethodName: "ListTypes",
			Handler:    _Resources_ListTypes_Handler,
		},
	},
	Streams: []grpc.StreamDesc{
		{
			StreamName:    "List",
			Handler:       _Resources_List_Handler,
			ServerStreams: true,
		},
	},
}
